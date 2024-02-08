import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from "typeorm";

@Entity()
export class ChatMessages extends BaseEntity {
  @PrimaryGeneratedColumn("rowid")
  id: number;

  @Column("string")
  message: string;

  @Column("string")
  nameSender: string;

  @Column("timestamp with local time zone")
  created_at: Date;

  @Column("int8")
  id_user: number;
}
