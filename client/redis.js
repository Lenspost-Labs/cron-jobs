const { createClient } = require("redis");

const redis = createClient({
  url: process.env.REDIS_CACHE,
});

redis.on("error", (err) => {
  console.log("Redis Caching client error: ", err);
});

redis.on("connect", () => {
  console.log("Redis client connected");
});

redis.connect();

module.exports = redis;
