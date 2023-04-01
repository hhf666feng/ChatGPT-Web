import * as dotenv from 'dotenv'
import 'isomorphic-fetch'
import db from '../utils/database'

dotenv.config()

interface User {
  id?: number
  openid: string
  power: number
  created_at?: Date
  updated_at?: Date
}

async function getUser(openid: string): Promise<User> {
  if (!openid)
    throw new Error('OpenID is empty')

  const sql = 'SELECT * FROM users WHERE openid = ?'
  return new Promise<User>((resolve, reject) => {
    db.query(sql, [openid], (err, data) => {
      if (err)
        reject(err)
      if (data.length !== 0)
        resolve(data[0])
      resolve(null)
    })
  })
}

async function getOrcreateUser(openid: string) {
  if (!openid)
    throw new Error('OpenID is empty')

  const user = await getUser(openid)
  if (user)
    return user.id
  const sql = 'replace INTO users (openid,power) VALUES (?,0)'

  return new Promise((resolve, reject) => {
    db.query(sql, [openid], (err, data) => {
      if (err)
        reject(err)
      resolve(data.insertId)
    })
  })
}

// CREATE TABLE `chat_logs` (
//   `id` int(11) NOT NULL AUTO_INCREMENT,
//   `openid` varchar(255) NOT NULL,
//   `power` bigint(20) NOT NULL,
//   `total_tokens` int(11) unsigned NOT NULL,
//   `completion_tokens` int(11) unsigned NOT NULL,
//   `prompt_tokens` int(11) unsigned NOT NULL,
//   `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
//   `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
//   PRIMARY KEY (`id`),
//   KEY `openid_index` (`openid`)
// ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

interface ChatLog {
  id?: number
  openid: string
  prompt: string
  power: number
  total_tokens: number
  completion_tokens: number
  prompt_tokens: number
  created_at?: Date
  updated_at?: Date
}

async function addChatLogs(chatLog: ChatLog) {
  if (!chatLog)
    throw new Error('No chatLog')

  const sql = 'INSERT INTO chat_logs (openid,prompt,power,total_tokens,completion_tokens,prompt_tokens) VALUES (?,?,?,?,?,?)'

  return new Promise((resolve, reject) => {
    db.query(sql, [chatLog.openid, chatLog.prompt, chatLog.power, chatLog.total_tokens, chatLog.completion_tokens, chatLog.prompt_tokens], (err, data) => {
      if (err)
        reject(err)
      resolve(data.insertId)
    })
  })
}

export { getUser, getOrcreateUser, addChatLogs }
