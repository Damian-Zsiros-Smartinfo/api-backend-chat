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
  UpdateDateColumn,
} from "typeorm";
import { ChatMessage } from "./ChatMessage";

@Entity("images")
export class Image extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ChatMessage, (chatMessage) => chatMessage.id, {
    eager: true,
  })
  @JoinColumn({ name: "idMessage" })
  idMessage: { id: number | 0 } | number;

  @Column()
  image: string;

  @CreateDateColumn()
  created_at: Date;
}
