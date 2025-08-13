import RateLimiter from "express-rate-limit";

  export const rateLimiter = RateLimiter({
    windowMs: 1 * 60 * 1000, // 15 minutes
    max: 60, // Limit each IP to 100 requests per windowMs
    message: "Too many requests, please try again later.",
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  });