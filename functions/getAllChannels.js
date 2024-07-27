const axios = require("axios");
const fs = require("fs");

const getAllChannels = async () => {
  const response = await axios.get("https://api.warpcast.com/v2/all-channels");
  return response.data.result.channels;
};

module.exports = getAllChannels;