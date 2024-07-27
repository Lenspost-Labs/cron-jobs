const dotenv = require("dotenv");
dotenv.config();

const update_score_for_feed = require("./jobs/update_score_for_feed");

update_score_for_feed();