
const {
  connectDatabases,
  closeDatabases,
  postgres,
  getMongoDatabase,
} = require('../src/database');

const { setupSchema } = require('../src/schema');

const {
  insertMongoThenPostgres,
} = require('../src/persistence');

async function main() {
  const produto = {
    id: 2002,
    nome: 'Produto de teste - Cenário 2',
    preco: 49.90,
  };

  try {
    await connectDatabases();
    await setupSchema();

    // Limpa dados de execuções anteriores.
    await postgres.query(
      'DELETE FROM produtos WHERE id = $1',
      [produto.id]
    );

    const collection = getMongoDatabase()
      .collection('produtos');

    await collection.deleteMany({ id: produto.id });

    console.log('\n--- Cenário 2: falha no PostgreSQL ---');

    let falhaEsperada = false;

    try {
      await insertMongoThenPostgres(produto, {
        simulatePostgresFailure: true,
      });
    } catch (error) {
      falhaEsperada = true;
      console.log('Falha esperada capturada:', error.message);
    }

    // Verifica se o registro foi removido do MongoDB.
    const registroMongo = await collection.findOne({
      id: produto.id,
    });

    // Verifica se não existe registro no PostgreSQL.
    const resultadoPostgres = await postgres.query(
      'SELECT * FROM produtos WHERE id = $1',
      [produto.id]
    );

    const existeMongo = registroMongo !== null;
    const existePostgres = resultadoPostgres.rowCount > 0;

    console.log(
      'Registro existe no MongoDB após rollback:',
      existeMongo
    );

    console.log(
      'Registro existe no PostgreSQL:',
      existePostgres
    );

    if (
      falhaEsperada &&
      !existeMongo &&
      !existePostgres
    ) {
      console.log(
        '\nSUCESSO: rollback do MongoDB confirmado!'
      );
    } else {
      throw new Error(
        'O teste do rollback não passou.'
      );
    }
  } catch (error) {
    console.error('\nERRO NO TESTE:', error.message);
    process.exitCode = 1;
  } finally {
    await closeDatabases();
  }
}

main();
