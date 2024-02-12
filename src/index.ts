import { v2 as cloudinary } from 'cloudinary'
import express from 'express'
import { Server } from 'socket.io'
import http from 'http'
import supabase from './db/conexion'
import { getChatMessages } from './services/chatService'
import cors from 'cors'
import messageRouter from './routes/messagesRoutes'
import { Message } from 'types/chatTypes'
import morgan from 'morgan'
import { config } from 'dotenv'
import path from 'path'
import { writeFile } from 'fs/promises'
import uploadImage from './services/uploadImagesService'
config()

const PORT = process.env.PORT || 4000
const app = express()
const server = http.createServer(app)
export let messages: Partial<Message>[] | undefined = []
;(async () => {
  messages = await getChatMessages()
})()

app.use(cors())
app.use(express.json())

app.use(morgan('combined'))

app.get('/', (req, res) => {
  res.json({})
})

app.use(messageRouter)

const io = new Server(server, {
  cors: {
    origin: '*',
  },
})

io.on('connection', (socket) => {
  console.log({ message: 'a new client connected', id: socket.id })
  socket.join('chat')
  socket.to('chat').emit('server:loadmessages', messages)
  socket.on('server:addMessage', async function (data) {
    if (messages) {
      messages.push(data)
    }
    const { data: data2, error } =
      (await supabase
        .from('chat_messages')
        .upsert({ message: data.text, id_chat: 1, name_sender: data.actor })
        .select()) || []
    const dataMessagedAdded = data2 ?? []
    if (error) throw new Error()
    const imagesFile: { file: { name: string }; arrayBuffer: Buffer }[] =
      data.images
    imagesFile.map(async (image) => {
      const url = await uploadImage(image)
      await supabase
        .from('images')
        .insert({ link_image: url, id_message: dataMessagedAdded[0]?.id })
    })
    socket.broadcast.emit('server:loadmessages', messages)
  })
  socket.on('server:editMessage', async function (data) {
    const {
      messageId,
      messageEdited,
    }: { messageId: string; messageEdited: string } = data
    const { data: data2, error } =
      (await supabase
        .from('chat_messages')
        .update({ message: messageEdited })
        .eq('id', messageId)) || []
    if (error) throw new Error()
    socket.broadcast.emit('server:loadmessages', messages)
  })

  socket.on('disconnect', () => {
    console.log({ message: 'a client disconnected', id: socket.id })
  })
})

server.listen(PORT, () => {
  console.log(`Socket Server listening in PORT ${PORT}`)
})
