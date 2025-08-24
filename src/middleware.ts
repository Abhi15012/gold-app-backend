import RateLimiter from "express-rate-limit";

  export const rateLimiter = RateLimiter({
    windowMs: 1* 60 * 1000, 
    max: 10,
    message: "Too many requests, please try again later.",
    standardHeaders: true, 
    legacyHeaders: false, 

  });