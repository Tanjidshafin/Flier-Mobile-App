const { connectToDatabase, closeDatabaseConnection } = require('../config/database');
const { getEnvConfig } = require('../config/env');
const { hotelsSeedData } = require('../data/hotelsSeedData');
const { Hotel } = require('../models/Hotel');

async function seedHotels() {
  const config = getEnvConfig();

  await connectToDatabase({
    dbName: config.dbName,
    mongoUri: config.mongoUri,
  });

  await Promise.all(
    hotelsSeedData.map(hotel =>
      Hotel.updateOne({ slug: hotel.slug }, { $set: hotel }, { upsert: true }),
    ),
  );

  console.log(`Seeded ${hotelsSeedData.length} hotels into ${config.dbName}.`);
  await closeDatabaseConnection();
}

seedHotels().catch(async error => {
  console.error('Failed to seed hotel data.');
  console.error(error);
  await closeDatabaseConnection();
  process.exit(1);
});
