// Update with your config settings.

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") }); // ← path to backend/.env

console.log("ENV PATH:", path.resolve(__dirname, "../.env"));
console.log("DB_USER:", process.env.DB_USER, typeof process.env.DB_USER);
console.log(
  "DB_PASSWORD:",
  process.env.DB_PASSWORD,
  typeof process.env.DB_PASSWORD
);
console.log("DB_NAME:", process.env.DB_NAME, typeof process.env.DB_NAME);

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
  development: {
    client: "postgresql",
    connection: {
      database: "alumniPortal",
      user: "postgres",
      password: "abhishek",
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: "knex_migrations",
    },
  },

  production: {
    client: "postgresql",
    connection: {
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    },

    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: "knex_migrations",
    },
  },
};
