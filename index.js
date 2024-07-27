const dotenv = require("dotenv");
dotenv.config();

const update_score_for_feed = require("./jobs/update_score_for_feed");
const update_channels = require("./jobs/update_channels");

update_score_for_feed();
update_channels();

// Force exit after 5 minutes
setTimeout(() => {
    console.log('Forcing exit after timeout');
    process.exit(1);
  }, 5 * 60000);