import { randomUUID } from "node:crypto"
import { PDFParse } from "pdf-parse"
import { createWorker } from "tesseract.js"
import { prisma } from "../lib/prisma.js"

const MODULE_CODE_REGEX = /[A-Z]{2,4}\d{3,4}[A-Z]?/g
const STUDENT_NUMBER_REGEX = /(?:Student\s*(?:Number|No\.?))[^0-9]{0,20}([0-9]{7,10})/i
const STUDENT_NAME_REGEXES = [
  /(?:Student\s*Name|Name\s*&\s*Surname|Surname\s*&\s*Name|Full\s*Name)\s*[:\-]?\s*(.+)$/i,
  /(?:Name)\s*[:\-]?\s*([A-Za-z][A-Za-z\s.'-]{2,})$/i,
]

function normaliseCode(code) {
  return String(code || "").trim().toUpperCase()
}

function extractStudentNumber(rawText) {
  const match = String(rawText || "").match(STUDENT_NUMBER_REGEX)
  return match?.[1] || null
}

function extractStudentName(rawText) {
  const text = String(rawText || "")
  for (const regex of STUDENT_NAME_REGEXES) {
    const match = text.match(regex)
    if (match?.[1]) {
      return match[1].trim().replace(/\s{2,}/g, " ")
    }
  }

  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
  const fallbackLine = lines.find((line) => /[A-Za-z]/.test(line) && !/student\s*(number|no\.?)/i.test(line) && !/module|course|programme|registration/i.test(line))
  return fallbackLine || null
}

function extractModuleCodes(rawText) {
  const codes = String(rawText || "")
    .toUpperCase()
    .match(MODULE_CODE_REGEX) || []

  return [...new Set(codes.map(normaliseCode).filter(Boolean))]
}

function resolveCurrentStudentIdentity(currentStudent) {
  if (!currentStudent || typeof currentStudent !== "object") {
    return null
  }

  const emailStudentNumber = String(currentStudent.email || "").trim().toLowerCase().split("@")[0] || null

  return {
    id: currentStudent.id ?? currentStudent.studentId ?? null,
    studentNumber: currentStudent.studentNumber ?? emailStudentNumber ?? currentStudent.student?.studentNumber ?? null,
  }
}

async function extractTextFromDocument(documentBuffer) {
  const buffer = Buffer.isBuffer(documentBuffer) ? documentBuffer : Buffer.from(documentBuffer)

  if (buffer.slice(0, 4).toString() === "%PDF") {
    const parser = new PDFParse({ data: buffer })
    try {
      const parsed = await parser.getText()
      return parsed?.text?.trim() || ""
    } finally {
      await parser.destroy()
    }
  }

  const worker = await createWorker("eng")

  try {
    const result = await worker.recognize(buffer)
    return result?.data?.text?.trim() || ""
  } finally {
    await worker.terminate()
  }
}

async function createSystemNotification(client, { student, module, notificationActorId }) {
  return client.notification.create({
    data: {
      id: randomUUID().replace(/-/g, "").slice(0, 32),
      fromUserId: notificationActorId,
      toRole: "Student",
      toUserId: String(student.id),
      category: "System",
      priority: "normal",
      title: "System Enrollment Confirmed",
      message: `You have been enrolled in ${module.code} - ${module.name}.`,
    },
  })
}

export async function processRegistration(documentBuffer, options = {}) {
  if (!documentBuffer) {
    throw new Error("documentBuffer is required")
  }

  const currentStudent = resolveCurrentStudentIdentity(options.currentStudent)
  if (!currentStudent?.id && !currentStudent?.studentNumber) {
    throw new Error("currentStudent is required")
  }

  const notificationActorId = options.notificationActorId || "system"
  const fileName = options.fileName || null
  const rawText = await extractTextFromDocument(documentBuffer)
  const extractedName = extractStudentName(rawText)
  const studentNumber = extractStudentNumber(rawText)
  const detectedModuleCodes = extractModuleCodes(rawText)

  if (!studentNumber) {
    return {
      ok: false,
      error: "Student number could not be extracted from the registration document.",
      extractedName,
      studentNumber: null,
      modules: {
        matched: [],
        unmatched: detectedModuleCodes,
      },
      rawText,
    }
  }

  const studentId = Number(currentStudent.id)
  const studentLookup = Number.isFinite(studentId)
    ? { id: studentId }
    : { studentNumber: currentStudent.studentNumber }

  const student = await prisma.student.findFirst({
    where: studentLookup,
    select: {
      id: true,
      studentNumber: true,
      firstName: true,
      lastName: true,
      email: true,
      isVerified: true,
      status: true,
      proofFileName: true,
    },
  })

  if (!student) {
    return {
      ok: false,
      error: `No student record found for student number ${studentNumber}.`,
      extractedName,
      studentNumber,
      modules: {
        matched: [],
        unmatched: detectedModuleCodes,
      },
      rawText,
    }
  }

  if (normaliseCode(student.studentNumber) !== normaliseCode(studentNumber)) {
    await prisma.student.update({
      where: { id: student.id },
      data: {
        isVerified: false,
        status: "REJECTED",
        proofFileName: fileName,
      },
    })

    throw new Error("Student Number on document does not match account details.")
  }

  const modules = detectedModuleCodes.length
    ? await prisma.module.findMany({
        where: {
          code: {
            in: detectedModuleCodes,
          },
        },
        select: {
          id: true,
          code: true,
          name: true,
        },
      })
    : []

  const moduleByCode = new Map(modules.map((module) => [normaliseCode(module.code), module]))
  const matched = []
  const unmatched = []
  const enrollments = []
  const notifications = []

  await prisma.$transaction(async (tx) => {
    await tx.student.update({
      where: { id: student.id },
      data: {
        isVerified: true,
        status: "VERIFIED",
        proofFileName: fileName,
      },
    })

    for (const moduleCode of detectedModuleCodes) {
      const module = moduleByCode.get(moduleCode)

      if (!module) {
        unmatched.push(moduleCode)
        continue
      }

      matched.push(moduleCode)

      const existingEnrollment = await tx.enrollment.findUnique({
        where: {
          studentId_moduleId: {
            studentId: student.id,
            moduleId: module.id,
          },
        },
      })

      if (existingEnrollment) {
        enrollments.push({
          moduleCode,
          moduleId: module.id,
          status: "Already Enrolled",
        })
        continue
      }

      const enrollment = await tx.enrollment.create({
        data: {
          studentId: student.id,
          moduleId: module.id,
        },
      })

      const notification = await createSystemNotification(tx, {
        student,
        module,
        notificationActorId,
      })

      enrollments.push({
        enrollmentId: enrollment.id,
        moduleCode,
        moduleId: module.id,
        status: "Created",
      })

      notifications.push({
        notificationId: notification.id,
        moduleCode,
      })
    }
  })

  return {
    ok: true,
    extractedName,
    studentNumber,
    student: {
      id: student.id,
      studentNumber: student.studentNumber,
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      isVerified: student.isVerified,
      status: student.status,
      proofFileName: student.proofFileName,
    },
    modules: {
      matched,
      unmatched: detectedModuleCodes.filter((code) => !matched.includes(code)),
    },
    enrollments,
    notifications,
    rawText,
  }
}

export async function processRegistrationDocument(documentBuffer, options = {}) {
  return processRegistration(documentBuffer, options)
}

export async function extractRegistrationData(documentBuffer) {
  const rawText = await extractTextFromDocument(documentBuffer)

  return {
    rawText,
    extractedName: extractStudentName(rawText),
    studentNumber: extractStudentNumber(rawText),
    moduleCodes: extractModuleCodes(rawText),
  }
}

export default {
  processRegistration,
  processRegistrationDocument,
  extractRegistrationData,
}