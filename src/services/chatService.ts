import { Message } from 'types/chatTypes'
import supabase from '../db/conexion'

export async function getChatMessages() {
  try {
    let { data: chat_messages, error } = await supabase
      .from('chat_messages')
      .select('id,name_sender,message')

    if (!chat_messages) throw new Error()
    const chatMessagesWithImagesPromises = chat_messages.map(
      async (message: any) => {
        const messageInfo = message as Message
        let { data: images_messages, error: error2 } = await supabase
          .from('image')
          .select('*')
          .eq('id_message', messageInfo.id)
        return {
          id: messageInfo.id,
          actor: messageInfo.name_sender,
          text: messageInfo.message,
          images: images_messages,
        }
      }
    )
    const chatMessagesWithImages = Promise.all(chatMessagesWithImagesPromises)
    console.log(chatMessagesWithImages)
    return chatMessagesWithImages
  } catch (error) {
    console.error(error)
  }
}
