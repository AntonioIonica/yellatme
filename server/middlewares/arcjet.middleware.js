import aj from "../config/arcjet.js";

const arcjetMiddleware = async (req, res, next) => {
  try {
    // Added to bypass the stripe
    const isWebhook = req.originalUrl.startsWith("/api/webhook");
    const isStripe = req.headers["stripe-signature"];

    if (isWebhook || isStripe) {
      return next(); // bypass Arcjet completely
    }

    // Get the decision to check for reasons
    // requested: how many tokens from the bucket to take in a request
    const decision = await aj.protect(req, { requested: 1 });

    // Only when the connection is denied
    if (decision.isDenied()) {
      // reason - Rate limiter
      if (decision.reason.isRateLimit()) {
        return res.status(429).json({ error: "Too many requests!" });
      }

      //   reason - bot detected
      if (decision.reason.isBot()) {
        return res.status(403).json({ error: "Bot detected!" });
      }

      return res.status(403).json({ error: "Access denied!" });
    }

    // Allowing to pass through
    next();
  } catch (error) {
    console.error(`ArcJet middleware error: ${error}`);
    next(error);
  }
};

export default arcjetMiddleware;
