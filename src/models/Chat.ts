import { Column } from "typeorm";
import { PrimaryGeneratedColumn } from "typeorm";
import { Entity } from "typeorm";

@Entity()
export class Chat {
  @PrimaryGeneratedColumn("rowid")
  id: number;

  @Column("string")
  name: string;

  @Column("timestamp with local time zone")
  created_at: Date;
}
