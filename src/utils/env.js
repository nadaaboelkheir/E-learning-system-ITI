/* eslint-disable no-undef */
require("dotenv").config();

module.exports = {
  DB_USERNAME: process.env.DB_USERNAME,
  DB_DATABASE: process.env.DB_DATABASE,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_HOST: process.env.DB_HOST,
  PORT: process.env.PORT,
};
