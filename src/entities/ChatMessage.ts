import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  TableForeignKey,
} from "typeorm";
import { Chat } from "./Chat";

@Entity("chat_messages")
export class ChatMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Chat, (chat) => chat.id)
  @JoinColumn()
  id_chat: number;

  @Column("text", {
    default: "",
  })
  message: string;

  @Column()
  name_sender: string;

  @CreateDateColumn()
  created_at: Date;
}
