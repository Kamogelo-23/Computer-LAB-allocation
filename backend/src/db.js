import 'dotenv/config'
import { readFile } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import mysql from 'mysql2/promise'
import { initialDb } from './data.js'

const connectionOptions = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: Number(process.env.MYSQL_PORT || 3306),
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
}

let pool = null

const toSqlDate = (iso) => iso?.slice(0, 10) ?? null
const toSqlTime = (time) => time ?? null

async function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      ...connectionOptions,
      database: process.env.MYSQL_DATABASE || 'labconnect',
      waitForConnections: true,
      connectionLimit: 10,
      namedPlaceholders: true,
      dateStrings: true,
    })
  }
  return pool
}

async function bootstrapSchema() {
  const schemaUrl = new URL('../mysql-schema.sql', import.meta.url)
  const schemaSql = await readFile(schemaUrl, 'utf8')
  const adminPool = mysql.createPool({
    ...connectionOptions,
    waitForConnections: true,
    connectionLimit: 5,
    namedPlaceholders: true,
    multipleStatements: true,
  })

  try {
    await adminPool.query(schemaSql)
  } catch (error) {
    // Ignore duplicate key errors from existing indexes
    if (error.code !== 'ER_DUP_KEYNAME') {
      throw error
    }
    console.log('Database schema already exists, skipping index creation.')
  } finally {
    await adminPool.end()
  }
}

async function seedDatabase() {
  const activePool = await getPool()
  const connection = await activePool.getConnection()

  try {
    await connection.beginTransaction()

    // Clear existing demo accounts from previous runs (all u1-u6 IDs)
    await connection.execute('DELETE FROM notification_reads WHERE notification_id IN (SELECT id FROM notifications WHERE from_user_id IN (?, ?, ?, ?, ?, ?))', ['u1', 'u2', 'u3', 'u4', 'u5', 'u6'])
    await connection.execute('DELETE FROM notifications WHERE from_user_id IN (?, ?, ?, ?, ?, ?) OR to_user_id IN (?, ?, ?, ?, ?, ?)', ['u1', 'u2', 'u3', 'u4', 'u5', 'u6', 'u1', 'u2', 'u3', 'u4', 'u5', 'u6'])
    await connection.execute('DELETE FROM allocations WHERE lecturer_id IN (?, ?, ?, ?, ?, ?) OR created_by IN (?, ?, ?, ?, ?, ?)', ['u1', 'u2', 'u3', 'u4', 'u5', 'u6', 'u1', 'u2', 'u3', 'u4', 'u5', 'u6'])
    await connection.execute('DELETE FROM course_students WHERE user_id IN (?, ?, ?, ?, ?, ?)', ['u1', 'u2', 'u3', 'u4', 'u5', 'u6'])
    await connection.execute('DELETE FROM users WHERE id IN (?, ?, ?, ?, ?, ?)', ['u1', 'u2', 'u3', 'u4', 'u5', 'u6'])

    for (const venue of initialDb.venues) {
      await connection.execute(
        'INSERT IGNORE INTO venues (id, name, capacity, type, has_computers) VALUES (?, ?, ?, ?, ?)',
        [venue.id, venue.name, venue.capacity, venue.type, venue.hasComputers ? 1 : 0]
      )
    }
    console.log(`✓ Seeded ${initialDb.venues.length} venues`)

    for (const user of initialDb.users) {
      await connection.execute(
        'INSERT INTO users (id, name, email, role, password, is_verified, email_notif, in_app_notif, compact_mode) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          user.id,
          user.name,
          user.email,
          user.role,
          user.password,
          1,
          user.settings?.emailNotif ? 1 : 0,
          user.settings?.inAppNotif ? 1 : 0,
          user.settings?.compact ? 1 : 0,
        ]
      )
    }
    console.log(`✓ Seeded ${initialDb.users.length} staff users (1 Admin, 1 Scheduler, 2 Lecturers)`)
    console.log(`✓ Students must sign up via frontend with @tut4life.ac.za email`)

    for (const course of initialDb.courses) {
      await connection.execute(
        'INSERT IGNORE INTO courses (id, code, name, group_size, requires_lab, section, lecturer_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [course.id, course.code, course.name, course.groupSize, course.requiresLab ? 1 : 0, course.section || null, course.lecturerId || null]
      )
    }

    for (const user of initialDb.users) {
      for (const courseId of user.courses || []) {
        await connection.execute(
          'INSERT IGNORE INTO course_students (course_id, user_id) VALUES (?, ?)',
          [courseId, user.id]
        )
      }
    }

    for (const allocation of initialDb.allocations) {
      await connection.execute(
        'INSERT IGNORE INTO allocations (id, course_id, venue_id, lecturer_id, allocation_date, start_time, end_time, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          allocation.id,
          allocation.courseId,
          allocation.venueId,
          allocation.lecturerId,
          toSqlDate(allocation.date),
          toSqlTime(allocation.startTime),
          toSqlTime(allocation.endTime),
          allocation.createdBy || null,
          allocation.createdAt || new Date().toISOString(),
        ]
      )
    }

    for (const notification of initialDb.notifications) {
      await connection.execute(
        'INSERT IGNORE INTO notifications (id, from_user_id, to_role, to_user_id, title, message, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          notification.id,
          notification.fromUserId,
          notification.toRole || null,
          notification.toUserId || null,
          notification.title,
          notification.message,
          notification.createdAt || new Date().toISOString(),
        ]
      )

      for (const userId of notification.readBy || []) {
        await connection.execute(
          'INSERT IGNORE INTO notification_reads (notification_id, user_id) VALUES (?, ?)',
          [notification.id, userId]
        )
      }
    }

    await connection.commit()
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

async function ensureUserColumns() {
  const activePool = await getPool()
  const alterStatements = [
    'ALTER TABLE users ADD COLUMN is_verified TINYINT(1) NOT NULL DEFAULT 0',
    'ALTER TABLE users ADD COLUMN verification_token VARCHAR(255) NULL',
    'ALTER TABLE users ADD COLUMN verification_token_expires DATETIME NULL',
    'ALTER TABLE users ADD COLUMN reset_token VARCHAR(255) NULL',
    'ALTER TABLE users ADD COLUMN reset_token_expires DATETIME NULL',
  ]

  for (const sql of alterStatements) {
    try {
      await activePool.query(sql)
    } catch (error) {
      if (error.code !== 'ER_DUP_FIELDNAME') {
        throw error
      }
    }
  }
}

async function ensureNotificationColumns() {
  const activePool = await getPool()
  const alterStatements = [
    "ALTER TABLE notifications ADD COLUMN category ENUM('General', 'Allocation', 'Request', 'Reminder', 'System') NOT NULL DEFAULT 'General'",
    "ALTER TABLE notifications ADD COLUMN priority ENUM('low', 'normal', 'high') NOT NULL DEFAULT 'normal'",
    'ALTER TABLE notifications ADD COLUMN is_archived TINYINT(1) NOT NULL DEFAULT 0',
    'ALTER TABLE notifications ADD COLUMN expires_at DATETIME NULL',
  ]

  for (const sql of alterStatements) {
    try {
      await activePool.query(sql)
    } catch (error) {
      if (error.code !== 'ER_DUP_FIELDNAME') {
        throw error
      }
    }
  }

  const createIndexStatements = [
    'CREATE INDEX idx_notifications_to_role ON notifications(to_role)',
    'CREATE INDEX idx_notifications_to_user_id ON notifications(to_user_id)',
    'CREATE INDEX idx_notifications_created_at ON notifications(created_at)',
    'CREATE INDEX idx_notifications_is_archived ON notifications(is_archived)',
  ]

  for (const sql of createIndexStatements) {
    try {
      await activePool.query(sql)
    } catch (error) {
      if (error.code !== 'ER_DUP_KEYNAME') {
        throw error
      }
    }
  }
}

async function loadDbSnapshot() {
  const activePool = await getPool()

  const [venues] = await activePool.query('SELECT id, name, capacity, type, has_computers AS hasComputers FROM venues ORDER BY name')
  const [users] = await activePool.query('SELECT id, name, email, role, password, email_notif AS emailNotif, in_app_notif AS inAppNotif, compact_mode AS compact FROM users ORDER BY name')
  const [courses] = await activePool.query('SELECT id, code, name, group_size AS groupSize, requires_lab AS requiresLab, section, lecturer_id AS lecturerId FROM courses ORDER BY code')
  const [courseStudents] = await activePool.query('SELECT course_id AS courseId, user_id AS userId FROM course_students')
  const [allocations] = await activePool.query('SELECT id, course_id AS courseId, venue_id AS venueId, lecturer_id AS lecturerId, DATE_FORMAT(allocation_date, "%Y-%m-%d") AS date, TIME_FORMAT(start_time, "%H:%i") AS startTime, TIME_FORMAT(end_time, "%H:%i") AS endTime, created_by AS createdBy, created_at AS createdAt FROM allocations ORDER BY allocation_date, start_time')
  const [notifications] = await activePool.query('SELECT id, from_user_id AS fromUserId, to_role AS toRole, to_user_id AS toUserId, title, message, created_at AS createdAt FROM notifications ORDER BY created_at DESC')
  const [notificationReads] = await activePool.query('SELECT notification_id AS notificationId, user_id AS userId FROM notification_reads')
  const [logs] = await activePool.query('SELECT id, actor_user_id AS actorUserId, action, entity_type AS entityType, entity_id AS entityId, details, created_at AS createdAt FROM logs ORDER BY created_at DESC')

  const coursesByUser = new Map()
  for (const entry of courseStudents) {
    const list = coursesByUser.get(entry.userId) || []
    list.push(entry.courseId)
    coursesByUser.set(entry.userId, list)
  }

  const readsByNotification = new Map()
  for (const entry of notificationReads) {
    const list = readsByNotification.get(entry.notificationId) || []
    list.push(entry.userId)
    readsByNotification.set(entry.notificationId, list)
  }

  return {
    venues: venues.map((venue) => ({ ...venue, hasComputers: Boolean(venue.hasComputers) })),
    users: users.map((user) => ({
      ...user,
      emailNotif: Boolean(user.emailNotif),
      inAppNotif: Boolean(user.inAppNotif),
      compact: Boolean(user.compact),
      settings: {
        emailNotif: Boolean(user.emailNotif),
        inAppNotif: Boolean(user.inAppNotif),
        compact: Boolean(user.compact),
      },
      courses: coursesByUser.get(user.id) || [],
    })),
    courses: courses.map((course) => ({
      ...course,
      requiresLab: Boolean(course.requiresLab),
    })),
    allocations: allocations.map((allocation) => ({
      ...allocation,
      readBy: [],
    })),
    notifications: notifications.map((notification) => ({
      ...notification,
      readBy: readsByNotification.get(notification.id) || [],
    })),
    logs,
  }
}

export async function initDatabase() {
  await bootstrapSchema()
  await ensureUserColumns()
  await ensureNotificationColumns()
  await seedDatabase()
}

export async function getDatabaseSnapshot() {
  return loadDbSnapshot()
}

export async function findUserForLogin({ email, password, role }) {
  const activePool = await getPool()

  const [rows] = await activePool.execute(
    'SELECT id, name, email, role, password, is_verified, email_notif AS emailNotif, in_app_notif AS inAppNotif, compact_mode AS compact FROM users WHERE email = ? AND password = ? AND role = ? LIMIT 1',
    [email, password, role]
  )

  const user = rows[0]
  if (!user) {
    return null
  }

  // Students must verify email before login
  if (user.role === 'Student' && !user.is_verified) {
    throw new Error('Email not verified. Please check your email for verification link.')
  }

  const [courseRows] = await activePool.execute(
    'SELECT course_id AS courseId FROM course_students WHERE user_id = ?',
    [user.id]
  )

  return {
    ...user,
    emailNotif: Boolean(user.emailNotif),
    inAppNotif: Boolean(user.inAppNotif),
    compact: Boolean(user.compact),
    settings: {
      emailNotif: Boolean(user.emailNotif),
      inAppNotif: Boolean(user.inAppNotif),
      compact: Boolean(user.compact),
    },
    courses: courseRows.map((entry) => entry.courseId),
  }
}

export async function createAllocation(allocationData) {
  const activePool = await getPool()
  const connection = await activePool.getConnection()

  try {
    await connection.beginTransaction()

    const { id, courseId, venueId, lecturerId, allocationDate, startTime, endTime, createdBy } = allocationData

    await connection.execute(
      'INSERT INTO allocations (id, course_id, venue_id, lecturer_id, allocation_date, start_time, end_time, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, courseId, venueId, lecturerId, allocationDate, startTime, endTime, createdBy]
    )

    await connection.commit()

    // Fetch related data for email
    const [courseRows] = await activePool.query(
      'SELECT c.name, c.code, u.email, u.name FROM courses c JOIN users u ON c.lecturer_id = u.id WHERE c.id = ?',
      [courseId]
    )
    const course = courseRows[0]

    const [venueRows] = await activePool.query('SELECT name, capacity FROM venues WHERE id = ?', [venueId])
    const venue = venueRows[0]

    return {
      success: true,
      allocation: { id, courseId, venueId, lecturerId, allocationDate, startTime, endTime },
      emailData: course ? {
        lecturerEmail: course.email,
        lecturerName: course.name,
        courseName: course.name,
        courseCode: course.code,
        venueName: venue?.name,
        venueCapacity: venue?.capacity,
        allocationDate,
        startTime,
        endTime,
      } : null,
    }
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    await connection.release()
  }
}

export async function createNotification(notificationData) {
  const activePool = await getPool()
  const connection = await activePool.getConnection()

  try {
    await connection.beginTransaction()

    const { id, fromUserId, toRole, toUserId, title, message } = notificationData

    await connection.execute(
      'INSERT INTO notifications (id, from_user_id, to_role, to_user_id, title, message) VALUES (?, ?, ?, ?, ?, ?)',
      [id, fromUserId, toRole || null, toUserId || null, title, message]
    )

    await connection.commit()

    // Fetch recipient data for email
    let emailRecipients = []

    if (toUserId) {
      const [userRows] = await activePool.query(
        'SELECT email, name, email_notif AS emailNotif FROM users WHERE id = ?',
        [toUserId]
      )
      if (userRows[0]) {
        emailRecipients.push(userRows[0])
      }
    } else if (toRole) {
      const [roleRows] = await activePool.query(
        'SELECT email, name, email_notif AS emailNotif FROM users WHERE role = ?',
        [toRole]
      )
      emailRecipients = roleRows
    }

    return {
      success: true,
      notification: { id, fromUserId, toRole, toUserId, title, message },
      emailRecipients: emailRecipients.filter((r) => r.emailNotif),
    }
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    await connection.release()
  }
}

export async function createUser({ name, email, role, password, courses = [] }) {
  const activePool = await getPool()
  const connection = await activePool.getConnection()

  try {
    await connection.beginTransaction()

    // Check if user already exists
    const [existingUsers] = await connection.execute(
      'SELECT id FROM users WHERE email = ? LIMIT 1',
      [email]
    )

    if (existingUsers.length > 0) {
      return {
        success: false,
        error: 'Email already registered',
      }
    }

    const userId = randomUUID().substring(0, 32)
  const verificationToken = randomUUID()
  const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000)
  const isVerified = role !== 'Student' ? 1 : 0

    await connection.execute(
      'INSERT INTO users (id, name, email, role, password, is_verified, verification_token, verification_token_expires) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, name, email, role, password, isVerified, verificationToken, verificationExpires]
    )

    if (role === 'Lecturer') {
      await connection.execute('DELETE FROM courses WHERE lecturer_id = ?', [userId])
      await connection.execute('DELETE FROM course_students WHERE user_id = ?', [userId])

      const selectedCourses = Array.isArray(courses)
        ? [...new Set(courses.map((courseId) => String(courseId).trim()).filter(Boolean))]
        : []

      for (const courseId of selectedCourses) {
        await connection.execute('UPDATE courses SET lecturer_id = ? WHERE id = ?', [userId, courseId])
        await connection.execute('INSERT IGNORE INTO course_students (course_id, user_id) VALUES (?, ?)', [courseId, userId])
      }
    }

    await connection.commit()

    return {
      success: true,
      userId,
      verificationToken: role === 'Student' ? verificationToken : null,
      user: {
        id: userId,
        name,
        email,
        role,
      },
    }
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    await connection.release()
  }
}

export async function listUsers() {
  const activePool = await getPool()
  const [users] = await activePool.query(
    'SELECT id, name, email, role, password, is_verified AS isVerified, email_notif AS emailNotif, in_app_notif AS inAppNotif, compact_mode AS compact FROM users ORDER BY name'
  )

  const [courseRows] = await activePool.query('SELECT user_id AS userId, course_id AS courseId FROM course_students')
  const coursesByUser = new Map()
  for (const row of courseRows) {
    const list = coursesByUser.get(row.userId) || []
    list.push(row.courseId)
    coursesByUser.set(row.userId, list)
  }

  return users.map((user) => ({
    ...user,
    isVerified: Boolean(user.isVerified),
    emailNotif: Boolean(user.emailNotif),
    inAppNotif: Boolean(user.inAppNotif),
    compact: Boolean(user.compact),
    settings: {
      emailNotif: Boolean(user.emailNotif),
      inAppNotif: Boolean(user.inAppNotif),
      compact: Boolean(user.compact),
    },
    courses: coursesByUser.get(user.id) || [],
  }))
}

export async function updateUserById(userId, updates) {
  const activePool = await getPool()
  const connection = await activePool.getConnection()

  try {
    await connection.beginTransaction()

    const [rows] = await connection.execute('SELECT id, role FROM users WHERE id = ? LIMIT 1', [userId])
    if (rows.length === 0) {
      return { success: false, error: 'User not found' }
    }

    const currentRole = rows[0].role

    const fields = []
    const values = []

    if (typeof updates.name === 'string' && updates.name.trim()) {
      fields.push('name = ?')
      values.push(updates.name.trim())
    }

    if (typeof updates.email === 'string' && updates.email.trim()) {
      fields.push('email = ?')
      values.push(updates.email.trim().toLowerCase())
    }

    if (typeof updates.role === 'string' && updates.role.trim()) {
      fields.push('role = ?')
      values.push(updates.role)
    }

    if (typeof updates.password === 'string' && updates.password.trim()) {
      fields.push('password = ?')
      values.push(updates.password)
    }

    if (typeof updates.isVerified === 'boolean') {
      fields.push('is_verified = ?')
      values.push(updates.isVerified ? 1 : 0)
    }

    if (fields.length === 0 && updates.courses === undefined) {
      await connection.rollback()
      return { success: false, error: 'No valid fields to update' }
    }

    if (fields.length > 0) {
      values.push(userId)
      await connection.execute(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values)
    }

    const nextRole = typeof updates.role === 'string' && updates.role.trim() ? updates.role : currentRole

    if (nextRole === 'Lecturer' && updates.courses !== undefined) {
      const selectedCourses = Array.isArray(updates.courses)
        ? [...new Set(updates.courses.map((courseId) => String(courseId).trim()).filter(Boolean))]
        : []

      await connection.execute('UPDATE courses SET lecturer_id = NULL WHERE lecturer_id = ?', [userId])
      await connection.execute('DELETE FROM course_students WHERE user_id = ?', [userId])

      for (const courseId of selectedCourses) {
        await connection.execute('UPDATE courses SET lecturer_id = ? WHERE id = ?', [userId, courseId])
        await connection.execute('INSERT IGNORE INTO course_students (course_id, user_id) VALUES (?, ?)', [courseId, userId])
      }
    }

    if (nextRole !== 'Lecturer' && currentRole === 'Lecturer') {
      await connection.execute('UPDATE courses SET lecturer_id = NULL WHERE lecturer_id = ?', [userId])
      await connection.execute('DELETE FROM course_students WHERE user_id = ?', [userId])
    }

    await connection.commit()
    return { success: true }
  } catch (error) {
    await connection.rollback()
    return { success: false, error: error.message }
  } finally {
    await connection.release()
  }
}

export async function deleteUserById(userId) {
  const activePool = await getPool()
  const connection = await activePool.getConnection()

  try {
    await connection.beginTransaction()

    const [rows] = await connection.execute('SELECT id, role FROM users WHERE id = ? LIMIT 1', [userId])
    if (rows.length === 0) {
      return { success: false, error: 'User not found' }
    }

    await connection.execute('UPDATE courses SET lecturer_id = NULL WHERE lecturer_id = ?', [userId])
    await connection.execute('DELETE FROM course_students WHERE user_id = ?', [userId])
    await connection.execute('DELETE FROM notification_reads WHERE user_id = ?', [userId])
    await connection.execute('DELETE FROM notifications WHERE from_user_id = ? OR to_user_id = ?', [userId, userId])
    await connection.execute('DELETE FROM allocations WHERE lecturer_id = ? OR created_by = ?', [userId, userId])
    await connection.execute('DELETE FROM logs WHERE actor_user_id = ?', [userId]).catch(() => {})
    await connection.execute('DELETE FROM users WHERE id = ?', [userId])

    await connection.commit()
    return { success: true }
  } catch (error) {
    await connection.rollback()
    return { success: false, error: error.message }
  } finally {
    await connection.release()
  }
}

export async function verifyEmailToken(token) {
  const activePool = await getPool()
  const connection = await activePool.getConnection()

  try {
    const [rows] = await connection.execute(
      'SELECT id, email FROM users WHERE verification_token = ? AND verification_token_expires > NOW() LIMIT 1',
      [token]
    )

    if (rows.length === 0) {
      return { ok: false, error: 'Invalid or expired verification link' }
    }

    const user = rows[0]
    await connection.execute(
      'UPDATE users SET is_verified = 1, verification_token = NULL, verification_token_expires = NULL WHERE id = ?',
      [user.id]
    )

    return { ok: true, email: user.email, message: 'Email verified! You can now log in.' }
  } catch (error) {
    return { ok: false, error: error.message }
  } finally {
    await connection.release()
  }
}

export async function generatePasswordResetToken(email) {

  const activePool = await getPool()
  const connection = await activePool.getConnection()

  try {
    await connection.beginTransaction()

    // Check if user exists
    const [users] = await connection.execute(
      'SELECT id, name FROM users WHERE email = ? LIMIT 1',
      [email]
    )

    if (users.length === 0) {
      return {
        success: false,
        error: 'User not found',
      }
    }

    const user = users[0]
    const resetToken = randomUUID().substring(0, 32)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Store reset token
    await connection.execute(
      'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?',
      [resetToken, expiresAt, user.id]
    ).catch(() => {
      // Columns might not exist yet
    })

    await connection.commit()

    return {
      success: true,
      user,
      resetToken,
    }
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    await connection.release()
  }
}

export async function resetUserPassword(resetToken, newPassword) {
  const activePool = await getPool()
  const connection = await activePool.getConnection()

  try {
    await connection.beginTransaction()

    // Find user with valid reset token
    const [users] = await connection.execute(
      'SELECT id, reset_token_expires FROM users WHERE reset_token = ? LIMIT 1',
      [resetToken]
    ).catch(async () => {
      throw new Error('Password reset functionality not configured')
    })

    if (users.length === 0) {
      return {
        success: false,
        error: 'Invalid or expired reset token',
      }
    }

    const user = users[0]

    // Check if token is expired
    if (new Date() > new Date(user.reset_token_expires)) {
      return {
        success: false,
        error: 'Reset token has expired',
      }
    }

    // Update password and clear reset token
    await connection.execute(
      'UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
      [newPassword, user.id]
    )

    await connection.commit()

    return {
      success: true,
      message: 'Password reset successfully',
    }
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    await connection.release()
  }
}
