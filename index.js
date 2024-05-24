const dotenv = require("dotenv");
dotenv.config();

const update_user_data = require("./jobs/update_user_data");

update_user_data();
