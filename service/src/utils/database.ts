import mysql from 'mysql'

const db = mysql.createConnection({
  host: 'sh-cynosdbmysql-grp-5b6kxbeg.sql.tencentcdb.com',
  port: 22084,
  user: 'we_gpt_chat',
  password: '9azsJGkDssz78aFh',
  database: 'chat',
})
db.connect()
export default db
