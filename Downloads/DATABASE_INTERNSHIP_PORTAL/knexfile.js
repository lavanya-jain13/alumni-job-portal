// knexfile.js
const path = require('path');

module.exports = {
  development: {
    client: 'pg',
    connection: {
      host: 'localhost',
      user: 'postgres',
      password: 'jotajmani', // Replace with your password
      database: 'alumni_platform'
    },

    migrations: {
      directory: path.join(__dirname, 'db', 'migrations')
    }
  },
};