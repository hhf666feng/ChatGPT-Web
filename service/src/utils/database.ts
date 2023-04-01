import mysql from 'mysql'
import * as dotenv from 'dotenv'

dotenv.config()

const db = mysql.createConnection({
  host: process.env.MYSQL_HOTST,
  port: process.env.MYSQL_PORT,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
})
db.connect()
export default db
