import express from "express";
import { Server } from "socket.io";
import http from "http";
import { supabase } from "./db/conexion.js";
import { getChatMessages } from "./services/chatService.js";
import cors from "cors";

const PORT = process.env.PORT || 4000;
const app = express();
const server = http.createServer(app);
let messages = await getChatMessages();

app.use(cors());
app.use(express.json({ extended: false }));

app.get("/", (req, res) => {
  res.json({});
});
const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

app.get("/messages", (req, res) => {
  try {
    res.status(200).json({
      messages
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error
    });
  }
});

app.post("/update-message", async (req, res) => {
  try {
    const { messages } = req.body;
    await supabase
      .from("chat_messages")
      .insert({ message: data.text, id_chat: 1, name_sender: data.actor });
    res.status(200).json({
      ok: true
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error
    });
  }
});

io.on("connection", (socket) => {
  console.log({ message: "a new client connected", id: socket.id });
  socket.join("chat");
  socket.to("chat").emit("server:loadmessages", messages);
  socket.on("server:addMessage", function (data) {
    messages.push(data);
    socket.broadcast.emit("server:loadmessages", messages);
  });

  socket.on("disconnect", () => {
    console.log({ message: "a client disconnected", id: socket.id });
  });
});

server.listen(PORT, () => {
  console.log(`Socket Server listening in PORT ${PORT}`);
});
