import { readFileSync } from "fs";
import { spawnSync } from "child_process";

const env = Object.fromEntries(
  readFileSync(".env.fb.test", "utf8")
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const i = line.indexOf("=");
      return [line.slice(0, i), line.slice(i + 1)];
    }),
);

const token = env.FACEBOOK_PAGE_ACCESS_TOKEN;
if (!token) throw new Error("Missing FACEBOOK_PAGE_ACCESS_TOKEN");

spawnSync("vercel", ["env", "rm", "FACEBOOK_PAGE_ACCESS_TOKEN", "production", "--yes"], {
  stdio: "inherit",
  shell: true,
});

spawnSync("vercel", ["env", "add", "FACEBOOK_PAGE_ACCESS_TOKEN", "production"], {
  input: token,
  stdio: ["pipe", "inherit", "inherit"],
  shell: true,
});

console.log("FACEBOOK_PAGE_ACCESS_TOKEN added to Vercel production");
