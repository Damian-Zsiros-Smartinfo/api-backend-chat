import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Chat } from "./Chat";

@Entity("chat_messages")
export class ChatMessage extends BaseEntity {
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
