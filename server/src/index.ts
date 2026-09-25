import "dotenv/config";
import { config } from "./lib/config.js";
import { createApp } from "./app.js";

const app = createApp();

app.listen(config.PORT, () => {
  console.log(`API server listening on http://localhost:${config.PORT}`);
});
