const dotenv = require("dotenv");
dotenv.config();

const update_user_data_from_airstack = require("./jobs/update_user_data_from_airstack");
const update_social_score = require("./jobs/update_social_score");

// update_user_data_from_airstack();
update_social_score();
