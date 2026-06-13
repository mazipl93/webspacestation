import { config } from "dotenv";
import { Client } from "pg";

config({ path: ".env" });

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
if (!connectionString) {
  console.error("Missing DIRECT_URL or DATABASE_URL");
  process.exit(1);
}

async function main() {
  const client = new Client({ connectionString });
  await client.connect();

  const policies = await client.query(`
    select tablename, policyname, cmd, qual
    from pg_policies
    where tablename in ('user_article_likes', 'anon_article_likes')
    order by tablename, policyname
  `);

  const userCounts = await client.query(`
    select slug, count(*)::int as c
    from user_article_likes
    group by slug
    order by c desc
    limit 10
  `);

  const anonCounts = await client.query(`
    select slug, count(*)::int as c
    from anon_article_likes
    group by slug
    order by c desc
    limit 10
  `);

  const total = await client.query(`
    select
      (select count(*)::int from user_article_likes) as user_rows,
      (select count(*)::int from anon_article_likes) as anon_rows
  `);

  console.log(
    JSON.stringify(
      {
        policies: policies.rows,
        userCounts: userCounts.rows,
        anonCounts: anonCounts.rows,
        totals: total.rows[0],
      },
      null,
      2,
    ),
  );

  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
