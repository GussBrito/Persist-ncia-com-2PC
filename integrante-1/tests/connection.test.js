
const {
  connectDatabases,
  closeDatabases,
  postgres,
  getMongoDatabase,
} = require('../src/database');

async function main() {
  try {
    await connectDatabases();

    const pgResult = await postgres.query(
      'SELECT current_database() AS banco'
    );

    const mongoResult = await getMongoDatabase()
      .command({ ping: 1 });

    console.log(
      'Banco PostgreSQL:',
      pgResult.rows[0].banco
    );

    console.log(
      'Resposta do MongoDB:',
      mongoResult.ok === 1 ? 'OK' : 'Falha'
    );

    console.log('Conexões testadas com sucesso!');
  } catch (error) {
    console.error('Erro no teste:', error.message);
    process.exitCode = 1;
  } finally {
    await closeDatabases();
  }
}

main();
