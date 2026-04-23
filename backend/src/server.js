import express from 'express'
import cors from 'cors'
import multer from 'multer'
import { findUserForLogin, getDatabaseSnapshot, initDatabase, createUser, generatePasswordResetToken, resetUserPassword, verifyEmailToken, listUsers, updateUserById, deleteUserById } from './db.js'
import { initEmailService, sendEmail, emailTemplates } from './email.js'
import { extractRegistrationData } from './services/RegistrationService.js'

const app = express()
const port = process.env.PORT || 3001
const upload = multer({ storage: multer.memoryStorage() })

app.use(cors())
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'campusgrid-backend' })
})

app.get('/api/db', async (_req, res, next) => {
  try {
    const db = await getDatabaseSnapshot()
    res.json(db)
  } catch (error) {
    next(error)
  }
})

app.post('/api/login', async (req, res, next) => {
  const { email, password, role } = req.body ?? {}
  try {
    const user = await findUserForLogin({ email, password, role })
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    res.json({ user })
  } catch (error) {
    if (error.message && error.message.includes('Email not verified')) {
      return res.status(403).json({ error: error.message })
    }
    next(error)
  }
})

app.get('/api/admin/users', async (_req, res, next) => {
  try {
    const users = await listUsers()
    res.json({ success: true, users })
  } catch (error) {
    next(error)
  }
})

app.post('/api/admin/users', async (req, res, next) => {
  try {
    const { name, email, role, password } = req.body ?? {}

    if (!name || !email || !role || !password) {
      return res.status(400).json({ error: 'Missing required fields: name, email, role, password' })
    }

    if (!['Admin', 'Scheduler', 'Lecturer'].includes(role)) {
      return res.status(400).json({ error: 'Admin can only create staff users (Admin, Scheduler, Lecturer).' })
    }

    if (!email.toLowerCase().endsWith('@tut.ac.za')) {
      return res.status(400).json({ error: 'Staff accounts must use @tut.ac.za domain' })
    }

    const result = await createUser({ name, email: email.toLowerCase(), role, password })
    if (!result.success) {
      return res.status(400).json({ error: result.error })
    }

    res.status(201).json({ success: true, user: result.user })
  } catch (error) {
    next(error)
  }
})

app.put('/api/admin/users/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    const { name, email, role, password, isVerified } = req.body ?? {}

    if (!id) {
      return res.status(400).json({ error: 'User id is required' })
    }

    if (role && !['Admin', 'Scheduler', 'Lecturer', 'Student'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role value' })
    }

    const nextRole = role || null
    const nextEmail = typeof email === 'string' ? email.toLowerCase() : null

    if (nextRole && nextEmail) {
      const validDomain = nextRole === 'Student' ? '@tut4life.ac.za' : '@tut.ac.za'
      if (!nextEmail.endsWith(validDomain)) {
        return res.status(400).json({ error: `Email domain must match role. Expected ${validDomain}` })
      }
    }

    const result = await updateUserById(id, { name, email: nextEmail, role, password, isVerified })
    if (!result.success) {
      return res.status(400).json({ error: result.error })
    }

    res.json({ success: true })
  } catch (error) {
    next(error)
  }
})

app.delete('/api/admin/users/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    if (!id) {
      return res.status(400).json({ error: 'User id is required' })
    }

    const result = await deleteUserById(id)
    if (!result.success) {
      return res.status(400).json({ error: result.error })
    }

    res.json({ success: true })
  } catch (error) {
    next(error)
  }
})

app.post('/api/verify-email', async (req, res, next) => {
  try {
    const { token } = req.body ?? {}
    if (!token) {
      return res.status(400).json({ error: 'Verification token is required' })
    }

    const result = await verifyEmailToken(token)
    if (!result.ok) {
      return res.status(400).json({ error: result.error })
    }

    res.json({ ok: true, message: result.message, email: result.email })
  } catch (error) {
    next(error)
  }
})

app.post('/api/signup', async (req, res, next) => {
  try {
    const { name, email, password } = req.body ?? {}
    const normalizedEmail = email?.trim().toLowerCase()

    if (!name || !normalizedEmail || !password) {
      return res.status(400).json({ error: 'Missing required fields: name, email, password' })
    }

    // Only students can sign up
    if (!normalizedEmail.endsWith('@tut4life.ac.za')) {
      return res.status(400).json({ error: 'Only @tut4life.ac.za emails are allowed for student signup' })
    }

    const result = await createUser({ name, email: normalizedEmail, role: 'Student', password })

    if (!result.success) {
      return res.status(400).json({ error: result.error })
    }

    // Send welcome email
    const emailContent = emailTemplates.signupWelcome({
      name,
      email: normalizedEmail,
      password,
      role: 'Student',
      verifyUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify?token=${result.verificationToken}`,
    })

    const sent = await sendEmail({
      to: normalizedEmail,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    })

    if (!sent) {
      return res.status(502).json({ error: 'Failed to send verification email. Please check the address and try again.' })
    }

    res.status(201).json({ success: true, user: result.user, message: 'Account created! Check your email for verification link.' })
  } catch (error) {
    next(error)
  }
})

app.post('/api/admin/create-staff', async (req, res, next) => {
  try {
    const { name, email, role, password } = req.body ?? {}
    const normalizedEmail = email?.trim().toLowerCase()

    if (!name || !normalizedEmail || !role || !password) {
      return res.status(400).json({ error: 'Missing required fields: name, email, role, password' })
    }

    // Only Admin, Scheduler, or Lecturer can be created via this endpoint
    if (!['Admin', 'Scheduler', 'Lecturer'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be Admin, Scheduler, or Lecturer' })
    }

    // Staff email must use @tut.ac.za domain
    if (!normalizedEmail.endsWith('@tut.ac.za')) {
      return res.status(400).json({ error: 'Staff accounts must use @tut.ac.za domain' })
    }

    const result = await createUser({ name, email: normalizedEmail, role, password })

    if (!result.success) {
      return res.status(400).json({ error: result.error })
    }

    // Send welcome email
    const emailContent = emailTemplates.signupWelcome({
      name,
      email: normalizedEmail,
      password,
      role,
      loginUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
    })

    const sent = await sendEmail({
      to: normalizedEmail,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    })

    if (!sent) {
      return res.status(502).json({ error: 'Failed to send welcome email. Please check the address and try again.' })
    }

    res.status(201).json({ success: true, user: result.user, message: `${role} account created successfully. Welcome email sent.` })
  } catch (error) {
    next(error)
  }
})

app.post('/api/student/verify-por', upload.single('proof'), async (req, res, next) => {
  try {
    const currentStudent = req.body?.currentStudent ? JSON.parse(req.body.currentStudent) : null
    const fileName = req.file?.originalname || null
    const currentStudentNumber = String(currentStudent?.studentNumber || currentStudent?.email?.split('@')?.[0] || '').trim()

    if (!req.file) {
      return res.status(400).json({ error: 'Proof of Registration file is required' })
    }

    if (!currentStudentNumber) {
      return res.status(400).json({ error: 'currentStudent with email or studentNumber is required' })
    }

    const extracted = await extractRegistrationData(req.file.buffer)
    const extractedStudentNumber = extracted.studentNumber

    if (!extractedStudentNumber) {
      return res.status(400).json({
        error: 'Student number could not be extracted from the uploaded proof.',
        extracted,
      })
    }

    if (String(extractedStudentNumber).trim() !== currentStudentNumber) {
      return res.status(400).json({
        error: 'Student Number on document does not match account details.',
        extracted,
      })
    }

    return res.json({
      success: true,
      verified: true,
      status: 'VERIFIED',
      fileName,
      extracted,
      student: {
        ...currentStudent,
        studentNumber: currentStudentNumber,
        status: 'VERIFIED',
        proofFileName: fileName,
      },
    })
  } catch (error) {
    next(error)
  }
})

app.post('/api/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body ?? {}
    const normalizedEmail = email?.trim().toLowerCase()

    if (!normalizedEmail) {
      return res.status(400).json({ error: 'Email is required' })
    }

    const result = await generatePasswordResetToken(normalizedEmail)

    if (!result.success) {
      return res.status(400).json({ error: result.error })
    }

    // Send password reset email
    const emailContent = emailTemplates.passwordReset({
      name: result.user.name,
      resetLink: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${result.resetToken}`,
    })

    const sent = await sendEmail({
      to: normalizedEmail,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    })

    if (!sent) {
      return res.status(502).json({ error: 'Failed to send password reset email. Please try again.' })
    }

    res.json({ success: true, message: 'Password reset email sent' })
  } catch (error) {
    next(error)
  }
})

app.post('/api/reset-password', async (req, res, next) => {
  try {
    const { token, newPassword } = req.body ?? {}

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' })
    }

    const result = await resetUserPassword(token, newPassword)

    if (!result.success) {
      return res.status(400).json({ error: result.error })
    }

    res.json({ success: true, message: 'Password reset successfully' })
  } catch (error) {
    next(error)
  }
})

app.use((error, _req, res, _next) => {
  console.error(error)
  res.status(500).json({ error: 'Request failed', detail: error.message })
})

await initDatabase()
initEmailService()

app.listen(port, () => {
  console.log(`CampusGrid backend listening on http://localhost:${port}`)
})
