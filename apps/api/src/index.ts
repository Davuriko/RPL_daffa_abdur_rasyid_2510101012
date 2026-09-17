import "dotenv/config";
import { CreateApp } from "./app.js";

const port = Number(process.env.API_PORT ?? 4000);
const app = CreateApp();

app.listen(port, () => {
  console.log(`KampusBite API berjalan di http://localhost:${port}`);
});
