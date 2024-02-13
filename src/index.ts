import { v2 as cloudinary } from "cloudinary";
import express from "express";
import { Server } from "socket.io";
import http from "http";
import { getChatMessages } from "./services/chatService";
import cors from "cors";
import messageRouter from "./routes/messagesRoutes";
import { Message } from "types/chatTypes";
import morgan from "morgan";
import { config } from "dotenv";
import path from "path";
import { writeFile } from "fs/promises";
import uploadImage from "./services/uploadImagesService";
import { arrayBufferToBase64 } from "./utils/arrayBufferToBase64";
import { ChatMessage } from "./entities/ChatMessage";
import { Image } from "./entities/Image";
import { AppDataSource } from "./db/conexion";
config();

let messages: any = [];
const PORT = process.env.PORT || 4000;
const app = express();
const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: "*",
  },
  maxHttpBufferSize: 10e7, // Establece el tamaño máximo del paquete en bytes (por ejemplo, 100 MB)
});

async function main() {
  messages = await getChatMessages();

  app.use(cors());
  app.use(express.json());

  app.use(morgan("combined"));

  app.get("/", (req, res) => {
    res.json({});
  });

  app.use(messageRouter);

  AppDataSource.initialize();

  io.on("connection", (socket) => {
    console.log({ message: "a new client connected", id: socket.id });
    socket.join("chat");
    socket.broadcast.emit("server:loadmessages", messages);
    socket.on("server:addMessage", async function (data) {
      try {
        const chatMessageNew = new ChatMessage();
        chatMessageNew.message = data.text;
        chatMessageNew.id_chat = 1;
        chatMessageNew.name_sender = data.actor;
        await chatMessageNew.save();
        const chatMessageAdded = chatMessageNew;
        const imagesFile: {
          file: { name: string };
          arrayBuffer: Buffer;
          image: string;
        }[] = data.images;
        await imagesFile.forEach(async (image) => {
          const imageNew = new Image();
          imageNew.id_message = chatMessageAdded.id;
          imageNew.image = image.image;
          await imageNew.save();
        });
        if (messages) {
          messages.push({
            id: chatMessageNew.id,
            actor: chatMessageNew.name_sender,
            created_at: chatMessageNew.created_at,
            images: imagesFile,
            text: chatMessageNew.message,
          });
        }
        console.log(messages);
        socket.broadcast.emit("server:loadmessages", messages);
      } catch (error) {
        if (error instanceof Error) {
          console.error(error);
        }
      }
    });
    socket.on("server:editMessage", async function (data) {
      const {
        messageId,
        messageEdited,
      }: { messageId: string; messageEdited: string } = data;
      const messagesRepository = AppDataSource.getRepository(ChatMessage);
      const message =
        (await messagesRepository.findOneBy({ id: parseInt(messageId) })) ||
        new ChatMessage();
      message.message = messageEdited;
      await messagesRepository.save(message);
      messages = messages?.map((message: any) => {
        if (message.id == parseInt(messageId)) {
          return {
            ...message,
            text: messageEdited,
          };
        }
        return message;
      });
      socket.broadcast.emit("server:loadmessages", messages);
    });

    socket.on("server:deleteMessage", async function (data) {
      const messagesRepository = AppDataSource.getRepository(ChatMessage);
      await messagesRepository.delete({ id: parseInt(data) });
      messages = messages?.filter(
        (message: ChatMessage) => message.id == parseInt(data)
      );
      socket.broadcast.emit("server:loadmessages", messages);
    });

    socket.on("disconnect", () => {
      console.log({ message: "a client disconnected", id: socket.id });
    });
  });

  server.listen(PORT, () => {
    console.log(`Socket Server listening in PORT ${PORT}`);
  });
}

main();
