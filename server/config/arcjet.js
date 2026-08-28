import arcjet, { shield, detectBot, tokenBucket } from "@arcjet/node";
import { ARCJET_KEY} from "../config/env.js";


const aj = arcjet({
  key: ARCJET_KEY,
  proxies: ["0.0.0.0/0"], // proxy ranges
  rules: [
    shield({ mode: "LIVE" }),
    detectBot({
      mode: "DRY_RUN", // Blocks requests. Use "DRY_RUN" to log only or "LIVE"
      allow: [
        "CATEGORY:SEARCH_ENGINE",
        // See the full list at https://arcjet.com/bot-list
        "CATEGORY:MONITOR",
        "CATEGORY:PREVIEW",
        "CATEGORY:WEBHOOK",
        "POSTMAN",
      ],
    }),
    tokenBucket({
      mode: "LIVE",
      // See https://docs.arcjet.com/fingerprints
      characteristics: [],
      refillRate: 50, // Refill 5 tokens per interval
      interval: 1, // Refill every 10 seconds
      capacity: 100, // Bucket capacity of 10 tokens
    }),
  ],
});

export default aj;
