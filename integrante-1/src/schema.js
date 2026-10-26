
const { postgres, getMongoDatabase } = require('./database');

async function setupSchema() {
  await postgres.query(`
    CREATE TABLE IF NOT EXISTS produtos (
      id INTEGER PRIMARY KEY,
      nome VARCHAR(100) NOT NULL,
      preco NUMERIC(10, 2) NOT NULL
    )
  `);

  const mongo = getMongoDatabase();

  await mongo.collection('produtos').createIndex(
    { id: 1 },
    { unique: true }
  );

  console.log('Tabela e índice preparados!');
}

module.exports = { setupSchema };
