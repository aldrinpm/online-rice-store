// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://uxhhxxzbnxkjuvehdzym.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4aGh4eHpibnhranV2ZWhkenltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNTkyNjYsImV4cCI6MjA3MjczNTI2Nn0.hhUpslLlp4DLHbgI-bE3D-L23R7rHZaYzwEfWpdc5-M";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
