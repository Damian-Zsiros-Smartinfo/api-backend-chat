import { supabase } from "../db/conexion.js";

export async function getChatMessages() {
    try {
        let { data: chat_messages, error } = await supabase
            .from('chat_messages')
            .select('*')

        
        return chat_messages.map(message => {

            return {
                id: message.id,
                actor: message.name_sender,
                text: message.message
            }
        })
    } catch (error) {
        console.error(error)
    }
}