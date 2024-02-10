import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { DataSource } from "typeorm";

config();

const supabaseUrl = process.env.SUPABASE_URL ?? "";
const supabaseKey = process.env.SUPABASE_KEY ?? "";
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
