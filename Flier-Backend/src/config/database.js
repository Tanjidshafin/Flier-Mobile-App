const dns = require('dns');
const mongoose = require('mongoose');

let database;
let connectionPromise;

async function connectToDatabase({ mongoUri, dbName }) {
  if (database && mongoose.connection.readyState === 1) {
    return database;
  }

  if (!connectionPromise) {
    dns.setServers(['1.1.1.1', '8.8.8.8']);

    connectionPromise = mongoose
      .connect(mongoUri, {
        dbName,
        serverSelectionTimeoutMS: 5000,
      })
      .then(() => {
        database = mongoose.connection;
        return database;
      })
      .catch(error => {
        connectionPromise = undefined;
        throw error;
      });
  }

  return connectionPromise;
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
    connectionPromise = undefined;
  }
}

module.exports = {
  closeDatabaseConnection,
  connectToDatabase,
  getDatabase,
  getDatabaseStatus,
};
