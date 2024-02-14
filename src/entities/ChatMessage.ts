import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Chat } from "./Chat";

@Entity("chat_messages")
export class ChatMessage extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Chat, (chat) => chat.id)
  @JoinColumn({ name: "idChat" })
  id_chat: number;

  @Column("text", {
    default: "",
  })
  message: string;

  @Column()
  name_sender: string;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamp" })
  updatedAt: Date;
}
