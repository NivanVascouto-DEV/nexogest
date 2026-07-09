require('dotenv').config();
const { Pool } = require('pg');

const { types } = require('pg');
types.setTypeParser(1114, (val) => val);

const pool = new Pool({ connectionString: process.env.DATABASE_URL});;

pool.on('connect', (client) => {
  client.query("SET TIMEZONE = 'America/Sao_Paulo'");
});

module.exports = pool;