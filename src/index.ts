import { Resonate } from "@resonatehq/sdk";
import { scrape } from "./scraper.js";

const resonate = new Resonate({ url: "http://localhost:8001" });

resonate.register("scrape", scrape);

process.on("SIGINT", () => {
  resonate.stop();
  process.exit(0);
});

process.on("SIGTERM", () => {
  resonate.stop();
  process.exit(0);
});
