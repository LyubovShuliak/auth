import { config } from 'dotenv';
import mongoose from 'mongoose';

config();
const MONGO_URL = process.env.MONGO_URL || '';

mongoose.connection.once('open', () => {
  console.log('Mongo Conection ready');
});

mongoose.connection.on('error', (err) => {
  console.error(err);
});

export async function mongoConnect() {
  await mongoose.connect(MONGO_URL);
}
