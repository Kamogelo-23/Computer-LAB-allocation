import nodemailer from 'nodemailer'

let transporter = null

export function initEmailService() {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_PORT == 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  })
}

export async function sendEmail({ to, subject, html, text }) {
  if (!transporter) {
    console.error('Email service not initialized')
    return false
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
      text,
    })
    console.log(`Email sent to ${to}: ${info.messageId}`)
    return true
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error.message)
    return false
  }
}

// Email templates
export const emailTemplates = {
  signupWelcome: (userData) => ({
    subject: 'Welcome to CampusGrid - Confirm Your Account',
    html: `
      <h2>Welcome to CampusGrid!</h2>
      <p>Hi ${userData.name},</p>
      <p>Your account has been successfully created. Please verify your email to activate your account:</p>
      <p><a href="${userData.verifyUrl}" style="background-color: #22c55e; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email</a></p>
      <p>Or copy this link: ${userData.verifyUrl}</p>
      <p>This link expires in 24 hours.</p>
      <p>Once verified, you can log in with these credentials:</p>
      <ul>
        <li><strong>Email:</strong> ${userData.email}</li>
        <li><strong>Password:</strong> ${userData.password}</li>
        <li><strong>Role:</strong> ${userData.role}</li>
      </ul>
      <p><strong>Important:</strong> Please change your password after your first login for security.</p>
      <p>If you did not create this account, please contact our support team immediately.</p>
      <p>Best regards,<br>CampusGrid Team</p>
    `,
    text: `Welcome to CampusGrid!\n\nYour account has been created.\nEmail: ${userData.email}\nPassword: ${userData.password}\nRole: ${userData.role}\n\nPlease change your password after first login.`,
  }),

  passwordReset: (resetData) => ({
    subject: 'Password Reset Request - CampusGrid',
    html: `
      <h2>Password Reset Request</h2>
      <p>Hi ${resetData.name},</p>
      <p>We received a request to reset your password. Click the link below to create a new password:</p>
      <p><a href="${resetData.resetLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a></p>
      <p>This link expires in 24 hours.</p>
      <p>If you did not request a password reset, please ignore this email or contact support if you suspect unauthorized access.</p>
      <p>Best regards,<br>CampusGrid Team</p>
    `,
    text: `Password Reset Request\n\nClick the link to reset your password: ${resetData.resetLink}\n\nThis link expires in 24 hours.\n\nIf you didn't request this, please ignore this email.`,
  }),
}
