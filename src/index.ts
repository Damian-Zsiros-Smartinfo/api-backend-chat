import { v2 as cloudinary } from 'cloudinary';
import express from "express";
import { Server } from "socket.io";
import http from "http";
import supabase from "./db/conexion";
import { getChatMessages } from "./services/chatService.js";
import cors from "cors";
import messageRouter from "./routes/messagesRoutes";
import { Message } from "types/chatTypes";
import morgan from "morgan";
import { config } from 'dotenv';
config()

const PORT = process.env.PORT || 4000;
const app = express();
const server = http.createServer(app);
export let messages: Partial<Message>[] | undefined = [];


(async () => {
  messages = await getChatMessages();
})();

app.use(cors());
app.use(express.json());

app.use(morgan("combined"));

app.get("/", (req, res) => {
  res.json({});
});

app.use(messageRouter);

const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

io.on("connection", (socket) => {
  console.log({ message: "a new client connected", id: socket.id });
  socket.join("chat");
  socket.to("chat").emit("server:loadmessages", messages);
  socket.on("server:addMessage", async function (data) {
    console.log(data.images[0])
    if (messages) {
      messages.push(data);
    }
    await supabase
      .from("chat_messages")
      .insert({ message: data.text, id_chat: 1, name_sender: data.actor });
    const imagesFile: string[] = data.images
    imagesFile.map(async image => {
      await uploadImage(image)
    })
    socket.broadcast.emit("server:loadmessages", messages);
  });
  socket.on("disconnect", () => {
    console.log({ message: "a client disconnected", id: socket.id });
  });
});


async function uploadImage(imageFile: string) {
  try {
    // Configura tus credenciales de Cloudinary
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });

    cloudinary.uploader.upload(imageFile, (error, result) => {
      if (error) {
        console.error('Error al subir la imagen a Cloudinary:', error);
      } else {
        console.log('URL de la imagen subida:', result?.secure_url);
        return result?.secure_url
      }
    });
  } catch (error) {
    console.error('Error al procesar la imagen:', error);
    throw new Error('Error al procesar la imagen');
  }
}

server.listen(PORT, () => {
  console.log(`Socket Server listening in PORT ${PORT}`);
});
