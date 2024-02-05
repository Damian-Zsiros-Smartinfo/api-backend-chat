import express from "express";
import { Server } from "socket.io";
import http from "http";
import conversations from "../conversations.json" assert { type: "json" };

import fs from "fs";
const PORT = 4000;
const app = express();
const server = http.createServer(app);
let messages = conversations;

app.get("/", (req, res) => {
  res.json({
    message: "sadasdas"
  });
});
const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

app.get("/messages", (req, res) => {
  try {
    res.status(200).json({
      ok: true,
      messages
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error
    });
  }
});

app.post("/update-message", (req, res) => {
  try {
    const { messages } = req.body;
    fs.writeFileSync("conversations.json", JSON.stringify(messages));
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
    console.log(socket.id, "disconnected");
  });
});

server.listen(PORT, () => {
  console.log(`Listening in PORT ${PORT}`);
});
