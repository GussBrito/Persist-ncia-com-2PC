
const {
  connectDatabases,
  closeDatabases,
  postgres,
  getMongoDatabase,
} = require('../src/database');

const { setupSchema } = require('../src/schema');
const {
  insertPostgresThenMongo,
} = require('../src/persistence');

async function main() {
  const produto = {
    id: 1001,
    nome: 'Produto de teste - Cenário 1',
    preco: 29.90,
  };

  try {
    await connectDatabases();
    await setupSchema();

    // Remove possíveis dados de uma execução anterior.
    await postgres.query(
      'DELETE FROM produtos WHERE id = $1',
      [produto.id]
    );

    await getMongoDatabase()
      .collection('produtos')
      .deleteMany({ id: produto.id });

    console.log('\n--- Cenário 1: falha no MongoDB ---');

    let falhaEsperada = false;

    try {
      await insertPostgresThenMongo(produto, {
        simulateMongoFailure: true,
      });
    } catch (error) {
      falhaEsperada = true;
      console.log('Falha esperada capturada:', error.message);
    }

    const resultado = await postgres.query(
      'SELECT * FROM produtos WHERE id = $1',
      [produto.id]
    );

    const registroExiste = resultado.rowCount > 0;

    console.log(
      'Registro existe no PostgreSQL após rollback:',
      registroExiste
    );

    if (falhaEsperada && !registroExiste) {
      console.log('\nSUCESSO: rollback do PostgreSQL confirmado!');
    } else {
      throw new Error('O teste do rollback falhou.');
    }
  } catch (error) {
    console.error('\nERRO NO TESTE:', error.message);
    process.exitCode = 1;
  } finally {
    await closeDatabases();
  }
}

main();
