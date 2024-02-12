import { Message } from "types/chatTypes";
import { io, messages } from "../index";
import { Router } from "express";
import { getChatMessages } from "../services/chatService";

const router = Router();

router.get("/messages", async (req, res) => {
  try {
    const messages = await getChatMessages();
    res.status(200).json({
      messages,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error,
    });
  }
});

router.post("/messages", (req, res) => {
  try {
    const data = req.body;
    io.on("connection", (socket) => {
      io.emit("server:addMessage", data);
    });
    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

router.put("/messages", (req, res) => {
  try {
    const data = req.body;
    io.emit("server:editMessage", data);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

export default router;
