import express from "express";
import { Server } from "socket.io";
import http from "http";
import { supabase } from "./db/conexion";
import { getChatMessages } from "./services/chatService.js";
import cors from "cors";
import messageRouter from "./routes/messagesRoutes";

const PORT = process.env.PORT || 4000;
const app = express();
const server = http.createServer(app);
export let messages = (await getChatMessages()) || [];

app.use(cors());
app.use(express.json());

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
    messages.push(data);
    await supabase
      .from("chat_messages")
      .insert({ message: data.text, id_chat: 1, name_sender: data.actor });
    socket.broadcast.emit("server:loadmessages", messages);
  });
  socket.on("disconnect", () => {
    console.log({ message: "a client disconnected", id: socket.id });
  });
});

server.listen(PORT, () => {
  console.log(`Socket Server listening in PORT ${PORT}`);
});
