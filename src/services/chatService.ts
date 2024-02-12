import { Image, Message } from "types/chatTypes";
import supabase from "../db/conexion";

export async function getChatMessages() {
  try {
    let { data: chat_messages, error } = await supabase
      .from("chat_messages")
      .select("*");

    if (!chat_messages) throw new Error();

    const messagesWithImagesPromises = chat_messages.map(
      async (message: any) => {
        const messageInfo = message as Message;

        let { data: images_messages, error: error3 } = await supabase
          .from("images")
          .select("*")
          .eq("id_message", message.id);

        return {
          id: messageInfo.id,
          actor: messageInfo.name_sender,
          text: messageInfo.message,
          images: images_messages as Image[],
        };
      }
    );

    const messagesWithImages = await Promise.all(messagesWithImagesPromises);
    return messagesWithImages;
  } catch (error) {
    console.error(error);
  }
}
