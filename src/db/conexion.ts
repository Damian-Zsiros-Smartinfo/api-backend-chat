import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { Chat } from "../entities/Chat";
import { ChatMessage } from "../entities/ChatMessage";
import { DataSource } from "typeorm";
import { Image } from "../entities/Image";
import { User } from "../entities/User";
import { OtpCode } from "../entities/OtpCode";

config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT || "5432"),
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  synchronize: true,
  logging: true,
  entities: [Chat, ChatMessage, Image, User, OtpCode],
  subscribers: [],
  migrations: [],
});
