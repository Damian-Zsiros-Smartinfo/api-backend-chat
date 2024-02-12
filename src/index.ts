import { v2 as cloudinary } from "cloudinary";
import express from "express";
import { Server } from "socket.io";
import http from "http";
import supabase, { AppDataSource } from "./db/conexion";
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
config();

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

export const io = new Server(server, {
  cors: {
    origin: "*",
  },
  maxHttpBufferSize: 10e7, // Establece el tamaño máximo del paquete en bytes (por ejemplo, 100 MB)
});

AppDataSource.initialize();

io.on("connection", (socket) => {
  console.log({ message: "a new client connected", id: socket.id });
  socket.join("chat");
  socket.to("chat").emit("server:loadmessages", messages);
  socket.on("server:addMessage", async function (data) {
    try {
      if (messages) {
        messages.push(data);
      }
      const { data: data2, error } =
        (await supabase
          .from("chat_messages")
          .upsert({ message: data.text, id_chat: 1, name_sender: data.actor })
          .select()) || [];
      const dataMessagedAdded = data2 ?? [];
      console.error(error);
      const imagesFile: {
        file: { name: string };
        arrayBuffer: Buffer;
        image: string;
      }[] = data.images;
      await imagesFile.forEach(async (image) => {
        await supabase
          .from("images")
          .insert({ image: image.image, id_message: dataMessagedAdded[0].id });
      });
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
    console.log(data);
    const { data: data2, error } =
      (await supabase
        .from("chat_messages")
        .update({ message: messageEdited })
        .eq("id", messageId)) || [];
    console.error(error);
    if (error) throw new Error();
    messages = messages?.map((message) => {
      if (message.id == messageId) {
        return {
          ...message,
          text: messageEdited,
        };
      }
      return message;
    });
    socket.broadcast.emit("server:loadmessages", messages);
  });

  socket.on("disconnect", () => {
    console.log({ message: "a client disconnected", id: socket.id });
  });
});

server.listen(PORT, () => {
  console.log(`Socket Server listening in PORT ${PORT}`);
});
