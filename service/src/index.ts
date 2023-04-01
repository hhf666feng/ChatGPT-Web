import express from 'express'
import type { ChatContext, ChatMessage } from './chatgpt'
import { chatConfig, chatReply, chatReplyProcess, code2Session } from './chatgpt'
import db from './utils/database'
import { addChatLogs, getOrcreateUser, getUser } from './users'

const app = express()
const router = express.Router()

app.use(express.static('public'))
app.use(express.json())

app.all('*', (_, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  res.header('Access-Control-Allow-Methods', '*')
  next()
})

router.post('/chat', async (req, res) => {
  try {
    const { prompt, options = {}, openid } = req.body as { prompt: string; options?: ChatContext;openid: string }
    // 若不存在则创建用户
    getOrcreateUser(openid)
    const response = await chatReply(prompt, options)
    if (response.status === 'Success') {
      const usage = response.data.detail.usage
      const total_tokens = usage.total_tokens
      const completion_tokens = usage.completion_tokens
      const prompt_tokens = usage.prompt_tokens
      addChatLogs({ openid, prompt, power: 0, total_tokens, completion_tokens, prompt_tokens })
    }
    res.send(response)
  }
  catch (error) {
    res.send(error)
  }
})

router.post('/chat-process', async (req, res) => {
  res.setHeader('Content-type', 'application/octet-stream')

  try {
    const { prompt, options = {} } = req.body as { prompt: string; options?: ChatContext }
    let firstChunk = true
    await chatReplyProcess(prompt, options, (chat: ChatMessage) => {
      res.write(firstChunk ? JSON.stringify(chat) : `\n${JSON.stringify(chat)}`)
      firstChunk = false
    })
  }
  catch (error) {
    res.write(JSON.stringify(error))
  }
  finally {
    res.end()
  }
})

router.post('/config', async (req, res) => {
  try {
    const response = await chatConfig()
    res.send(response)
  }
  catch (error) {
    res.send(error)
  }
})

router.get('/login', async (req, res) => {
  try {
    const code = <string>req.query.code ?? ''
    const response = await code2Session(code)
    res.send(response)
  }
  catch (error) {
    res.send(error)
  }
})

router.get('/power', async (req, res) => {
  try {
    const openid = <string>req.query.openid ?? ''
    if (!openid)
      throw new Error('OpenID is empty')

    res.send(getUser(openid))
    const sql = 'SELECT * FROM powers WHERE openid = ?'

    db.query(sql, [openid], (err, data) => {
      if (err)
        throw err
      res.send({ status: 'Success', data: data[0].power })
    })
  }
  catch (error) {
    res.send(error)
  }
})

router.get('/sub-power', async (req, res) => {
  try {
    const { openid, power } = req.body as { openid: string; power: number }
    if (!openid)
      throw new Error('OpenID is empty')
    const sql = 'UPDATE powers SET power = power - ? WHERE openid = ? AND power >= 0'

    db.query(sql, [power, openid], (err, data) => {
      if (err)
        throw err
      res.send({ status: 'Success', data })
    })
  }
  catch (error) {
    res.send(error)
  }
})

app.use('', router)
app.use('/api', router)

app.listen(3002, () => globalThis.console.log('Server is running on port 3002'))
