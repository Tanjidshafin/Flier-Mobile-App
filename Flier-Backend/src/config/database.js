const mongoose = require('mongoose');

let database;

async function connectToDatabase({ mongoUri, dbName }) {
  if (database) {
    return database;
  }

  await mongoose.connect(mongoUri, {
    dbName,
    serverSelectionTimeoutMS: 5000,
  });

  database = mongoose.connection;

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
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    database = undefined;
  }
}

module.exports = {
  closeDatabaseConnection,
  connectToDatabase,
  getDatabase,
  getDatabaseStatus,
};
