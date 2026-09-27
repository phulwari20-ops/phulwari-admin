import { createClient as createResilientClient } from "@/lib/supabase/client";

export const createClient = () => createResilientClient();
