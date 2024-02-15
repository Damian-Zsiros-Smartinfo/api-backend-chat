import { Router } from "express";
import express from "express";
import { Server } from "socket.io";
import http from "http";
import { getChatMessages } from "./services/chatService";
import cors from "cors";
import messageRouter from "./routes/messagesRoutes";
import authRoutes from "./routes/authRoutes";
import morgan from "morgan";
import { config } from "dotenv";
import { ChatMessage } from "./entities/ChatMessage";
import { Image } from "./entities/Image";
import { AppDataSource } from "./db/conexion";
import cookiesParser from "cookie-parser";
config();

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
  app.use(cors());
  app.use(express.json());
  app.use(morgan("combined"));

  app.get("/", (req, res) => {
    res.json({});
  });
  AppDataSource.initialize();

  app.use(messageRouter);
  app.use(authRoutes);

  io.on("connection", async (socket) => {
    console.log({ message: "a new client connected", id: socket.id });
    socket.join("chat");
    socket.broadcast.emit("server:loadmessages", await getChatMessages());
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
          imageNew.idMessage = chatMessageAdded.id;
          imageNew.image = image.image;
          await imageNew.save();
        });
        socket.broadcast.emit("server:loadmessages", await getChatMessages());
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

      socket.broadcast.emit("server:loadmessages", await getChatMessages());
    });

    socket.on("server:deleteMessage", async function (data) {
      const messagesRepository = AppDataSource.getRepository(ChatMessage);
      await messagesRepository.delete({ id: parseInt(data) });

      socket.broadcast.emit("server:loadmessages", await getChatMessages());
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
