import { messages } from "../index";
import { Router } from "express";

const router = Router();

router.get("/messages", (req, res) => {
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

export default router;
