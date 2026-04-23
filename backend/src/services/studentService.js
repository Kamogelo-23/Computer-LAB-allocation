import { prisma } from "../lib/prisma.js"

export async function getStudentsByModule(moduleCode) {
  const normalizedCode = String(moduleCode || "").trim().toUpperCase()

  if (!normalizedCode) {
    throw new Error("moduleCode is required")
  }

  // DB-level filtering: only students enrolled in the requested module code are returned.
  return prisma.student.findMany({
    where: {
      enrollments: {
        some: {
          module: {
            code: normalizedCode,
          },
        },
      },
    },
    select: {
      id: true,
      studentNumber: true,
      firstName: true,
      lastName: true,
      email: true,
      course: {
        select: {
          id: true,
          name: true,
          code: true,
          faculty: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      },
      enrollments: {
        where: {
          module: {
            code: normalizedCode,
          },
        },
        select: {
          enrolledAt: true,
          module: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
        },
      },
    },
  })
}
