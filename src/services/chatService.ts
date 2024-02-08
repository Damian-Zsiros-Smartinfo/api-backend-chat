import { Message } from "types/chatTypes.js";
import supabase from "../db/conexion.js";

export async function getChatMessages() {
  try {
    let { data: chat_messages, error } = await supabase
      .from("chat_messages")
      .select("");

    if (!chat_messages) throw new Error();

    return chat_messages.map((message: any) => {
      const messageInfo = message as Message;
      return {
        id: messageInfo.id,
        actor: messageInfo.name_sender,
        text: messageInfo.message
      };
    });
  } catch (error) {
    console.error(error);
  }
}
