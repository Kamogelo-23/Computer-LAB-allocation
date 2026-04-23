-- LabConnect MySQL schema for MySQL Workbench
-- Create the database and run this script in a MySQL 8+ connection.

CREATE DATABASE IF NOT EXISTS labconnect
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE labconnect;

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(32) PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  role ENUM('Admin', 'Scheduler', 'Lecturer', 'Student') NOT NULL,
  password VARCHAR(255) NOT NULL,
    is_verified TINYINT(1) NOT NULL DEFAULT 0,
    verification_token VARCHAR(255),
    verification_token_expires DATETIME,
  email_notif TINYINT(1) NOT NULL DEFAULT 1,
  in_app_notif TINYINT(1) NOT NULL DEFAULT 1,
  compact_mode TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS venues (
  id VARCHAR(32) PRIMARY KEY,
  name VARCHAR(120) NOT NULL UNIQUE,
  capacity INT NOT NULL,
  type ENUM('lab', 'lecture', 'seminar') NOT NULL,
  has_computers TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_venues_capacity CHECK (capacity > 0)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS courses (
  id VARCHAR(32) PRIMARY KEY,
  code VARCHAR(32) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  group_size INT NOT NULL,
  requires_lab TINYINT(1) NOT NULL DEFAULT 0,
  section VARCHAR(32) DEFAULT NULL,
  lecturer_id VARCHAR(32) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_courses_group_size CHECK (group_size > 0),
  CONSTRAINT fk_courses_lecturer
    FOREIGN KEY (lecturer_id) REFERENCES users(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS course_students (
  course_id VARCHAR(32) NOT NULL,
  user_id VARCHAR(32) NOT NULL,
  PRIMARY KEY (course_id, user_id),
  CONSTRAINT fk_course_students_course
    FOREIGN KEY (course_id) REFERENCES courses(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_course_students_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS allocations (
  id VARCHAR(32) PRIMARY KEY,
  course_id VARCHAR(32) NOT NULL,
  venue_id VARCHAR(32) NOT NULL,
  lecturer_id VARCHAR(32) NOT NULL,
  allocation_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_by VARCHAR(32) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_allocations_course
    FOREIGN KEY (course_id) REFERENCES courses(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_allocations_venue
    FOREIGN KEY (venue_id) REFERENCES venues(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT fk_allocations_lecturer
    FOREIGN KEY (lecturer_id) REFERENCES users(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT fk_allocations_created_by
    FOREIGN KEY (created_by) REFERENCES users(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT chk_allocations_time CHECK (start_time < end_time)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(32) PRIMARY KEY,
  from_user_id VARCHAR(32) NOT NULL,
  to_role ENUM('Admin', 'Scheduler', 'Lecturer', 'Student', 'All') DEFAULT NULL,
  to_user_id VARCHAR(32) DEFAULT NULL,
  category ENUM('General', 'Allocation', 'Request', 'Reminder', 'System') NOT NULL DEFAULT 'General',
  priority ENUM('low', 'normal', 'high') NOT NULL DEFAULT 'normal',
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_archived TINYINT(1) NOT NULL DEFAULT 0,
  expires_at DATETIME DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_notifications_target CHECK (to_role IS NOT NULL OR to_user_id IS NOT NULL),
  CONSTRAINT fk_notifications_from_user
    FOREIGN KEY (from_user_id) REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_notifications_to_user
    FOREIGN KEY (to_user_id) REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS notification_reads (
  notification_id VARCHAR(32) NOT NULL,
  user_id VARCHAR(32) NOT NULL,
  read_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (notification_id, user_id),
  CONSTRAINT fk_notification_reads_notification
    FOREIGN KEY (notification_id) REFERENCES notifications(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_notification_reads_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS logs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  actor_user_id VARCHAR(32) DEFAULT NULL,
  action VARCHAR(120) NOT NULL,
  entity_type VARCHAR(120) DEFAULT NULL,
  entity_id VARCHAR(32) DEFAULT NULL,
  details TEXT DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_logs_actor_user
    FOREIGN KEY (actor_user_id) REFERENCES users(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_courses_lecturer_id ON courses(lecturer_id);
CREATE INDEX idx_course_students_user_id ON course_students(user_id);
CREATE INDEX idx_allocations_course_id ON allocations(course_id);
CREATE INDEX idx_allocations_venue_id ON allocations(venue_id);
CREATE INDEX idx_allocations_lecturer_id ON allocations(lecturer_id);
CREATE INDEX idx_notifications_from_user_id ON notifications(from_user_id);
CREATE INDEX idx_notifications_to_role ON notifications(to_role);
CREATE INDEX idx_notifications_to_user_id ON notifications(to_user_id);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_notifications_is_archived ON notifications(is_archived);
CREATE INDEX idx_notification_reads_user_id ON notification_reads(user_id);
