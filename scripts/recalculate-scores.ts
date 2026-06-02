import { recalculateAllScores } from "../lib/news/recalculateScores";

recalculateAllScores()
  .then((result) => {
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
