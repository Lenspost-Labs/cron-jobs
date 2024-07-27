const dotenv = require("dotenv");
dotenv.config();

const update_score_for_feed = require("./jobs/update_score_for_feed");

update_score_for_feed();

// Force exit after 30 seconds
setTimeout(() => {
    console.log('Forcing exit after timeout');
    process.exit(1);
  }, 5 * 60000);