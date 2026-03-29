const { MongoClient, ServerApiVersion } = require('mongodb');

let client;
let database;

async function connectToDatabase({ mongoUri, dbName }) {
  if (database) {
    return database;
  }

  client = new MongoClient(mongoUri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
    serverSelectionTimeoutMS: 5000,
  });

  await client.connect();
  database = client.db(dbName);
  await database.command({ ping: 1 });

  return database;
}

function getDatabase() {
  if (!database) {
    throw new Error('Database has not been initialized.');
  }

  return database;
}

function getDatabaseStatus() {
  return Boolean(database);
}

async function closeDatabaseConnection() {
  if (client) {
    await client.close();
    client = undefined;
    database = undefined;
  }
}

module.exports = {
  closeDatabaseConnection,
  connectToDatabase,
  getDatabase,
  getDatabaseStatus,
};
