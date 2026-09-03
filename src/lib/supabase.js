import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

console.log("SUPABASE URL:", supabaseUrl);

console.log(
  "KEY PREFIX:",
  supabasePublishableKey?.substring(0, 15)
);

console.log(
  "KEY LENGTH:",
  supabasePublishableKey?.length
);

export const supabase = createClient(
  supabaseUrl,
  supabasePublishableKey
);