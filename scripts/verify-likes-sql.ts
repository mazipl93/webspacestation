import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !key) {
  console.error("Missing Supabase env");
  process.exit(1);
}

const supabase = createClient(url, key);
const slug = "iss-wyciek-powietrza-spacex-dragon-czerwiec-2026";

async function main() {
  const rpc = await supabase.rpc("get_article_like_count", { p_slug: slug });
  const view = await supabase
    .from("article_like_counts")
    .select("count")
    .eq("slug", slug)
    .maybeSingle();

  console.log(
    JSON.stringify(
      {
        rpc: { data: rpc.data, error: rpc.error?.message ?? null },
        view: { data: view.data, error: view.error?.message ?? null },
      },
      null,
      2,
    ),
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
