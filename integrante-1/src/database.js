
require('dotenv').config();

const { Pool } = require('pg');
const { MongoClient } = require('mongodb');

const postgres = new Pool({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT),
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
});

const mongoClient = new MongoClient(process.env.MONGO_URI);

let mongoDatabase;

async function connectDatabases() {
  await postgres.query('SELECT 1');

  await mongoClient.connect();
  mongoDatabase = mongoClient.db(
    process.env.MONGO_DATABASE
  );

  console.log('PostgreSQL conectado!');
  console.log('MongoDB conectado!');
}

async function closeDatabases() {
  await postgres.end();
  await mongoClient.close();
}

function getMongoDatabase() {
  if (!mongoDatabase) {
    throw new Error('MongoDB ainda não foi conectado.');
  }

  return mongoDatabase;
}

module.exports = {
  postgres,
  connectDatabases,
  closeDatabases,
  getMongoDatabase,
};
