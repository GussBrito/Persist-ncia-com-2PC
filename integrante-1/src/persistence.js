
const { postgres, getMongoDatabase } = require('./database');

// CENÁRIO 1: PostgreSQL primeiro; MongoDB depois.
async function insertPostgresThenMongo(produto, options = {}) {
  const mongo = getMongoDatabase();

  await postgres.query(
    `INSERT INTO produtos (id, nome, preco)
     VALUES ($1, $2, $3)`,
    [produto.id, produto.nome, produto.preco]
  );

  console.log('Produto inserido no PostgreSQL.');

  try {
    if (options.simulateMongoFailure) {
      throw new Error('Falha simulada no MongoDB.');
    }

    await mongo.collection('produtos').insertOne({
      id: produto.id,
      nome: produto.nome,
      preco: produto.preco,
    });

    console.log('Produto inserido no MongoDB.');
  } catch (error) {
    console.error('Falha na etapa MongoDB:', error.message);
    console.log('Executando compensação no PostgreSQL...');

    await postgres.query(
      'DELETE FROM produtos WHERE id = $1',
      [produto.id]
    );

    console.log('Compensação concluída no PostgreSQL.');
    throw error;
  }
}

// CENÁRIO 2: MongoDB primeiro; PostgreSQL depois.
async function insertMongoThenPostgres(produto, options = {}) {
  const collection = getMongoDatabase().collection('produtos');

  await collection.insertOne({
    id: produto.id,
    nome: produto.nome,
    preco: produto.preco,
  });

  console.log('Produto inserido no MongoDB.');

  try {
    if (options.simulatePostgresFailure) {
      throw new Error('Falha simulada no PostgreSQL.');
    }

    await postgres.query(
      `INSERT INTO produtos (id, nome, preco)
       VALUES ($1, $2, $3)`,
      [produto.id, produto.nome, produto.preco]
    );

    console.log('Produto inserido no PostgreSQL.');
  } catch (error) {
    console.error('Falha na etapa PostgreSQL:', error.message);
    console.log('Executando compensação no MongoDB...');

    await collection.deleteOne({ id: produto.id });

    console.log('Compensação concluída no MongoDB.');
    throw error;
  }
}

module.exports = {
  insertPostgresThenMongo,
  insertMongoThenPostgres,
};
