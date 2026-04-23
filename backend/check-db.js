import mysql from 'mysql2/promise'

const pool = mysql.createPool({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'Sophia@74',
  database: 'labconnect'
})

const [rows] = await pool.execute('SELECT id, email, password, role FROM users')
console.log('Users in database:')
console.table(rows)

await pool.end()
