import console from 'console'
import mysql from 'mysql'
import * as dotenv from 'dotenv'

dotenv.config()
console.log('Connecting to database...')
const cfg = {
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
}
console.log(cfg)
const db = mysql.createConnection(cfg)
db.connect()
export default db
