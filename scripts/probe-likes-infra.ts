import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

config({ path: ".env" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !key) {
  console.error("Missing Supabase env");
  process.exit(1);
}

const supabase = createClient(url, key);
const slug = `test-like-probe-${Date.now()}`;
const anonId = randomUUID();

async function main() {
  const toggleAnon = await supabase.rpc("toggle_anon_article_like", {
    p_slug: slug,
    p_anon_id: anonId,
  });

  const anonLiked = await supabase.rpc("anon_article_liked", {
    p_slug: slug,
    p_anon_id: anonId,
  });

  const anonId2 = randomUUID();
  const toggleAnon2 = await supabase.rpc("toggle_anon_article_like", {
    p_slug: slug,
    p_anon_id: anonId2,
  });

  const count = await supabase.rpc("get_article_like_count", { p_slug: slug });

  const toggleAuth = await supabase.rpc("toggle_article_like", { p_slug: slug });

  const legacy = await supabase.from("article_likes").select("slug,count").limit(3);
  const view = await supabase.from("article_like_counts").select("slug,count").limit(5);
  const userTable = await supabase.from("user_article_likes").select("slug").limit(1);

  console.log(
    JSON.stringify(
      {
        slug,
        toggleAnon,
        anonLiked,
        toggleAnon2,
        count,
        toggleAuth,
        legacy,
        view,
        userTable,
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
