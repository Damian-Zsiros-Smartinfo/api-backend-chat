import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  TableForeignKey,
} from "typeorm";
import { ChatMessage } from "./ChatMessage";

@Entity("images")
export class Image extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ChatMessage, (chatMessage) => chatMessage.id)
  @JoinColumn()
  id_message: number;

  @Column()
  image: string;

  @CreateDateColumn()
  created_at: Date;
}
