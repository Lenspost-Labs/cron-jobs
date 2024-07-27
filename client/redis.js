const { createClient } = require("redis");

const redis = createClient({
  url: process.env.REDIS_CACHE,
});

module.exports = redis;