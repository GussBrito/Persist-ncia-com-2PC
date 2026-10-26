
const {
  connectDatabases,
  closeDatabases,
} = require('../src/database');

const { setupSchema } = require('../src/schema');

async function main() {
  try {
    await connectDatabases();
    await setupSchema();

    console.log('Preparação concluída com sucesso!');
  } catch (error) {
    console.error('Erro na preparação:', error.message);
    process.exitCode = 1;
  } finally {
    await closeDatabases();
  }
}

main();
