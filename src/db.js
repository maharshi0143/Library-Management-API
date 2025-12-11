const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
  connectionString: "postgres://postgres:maharshi@localhost:5432/library_db"
});

module.exports = pool;
