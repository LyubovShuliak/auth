import { config } from 'dotenv';
import http from 'http';

import { app } from './app';
import { mongoConnect } from './services/mongo';
config();

const PORT = process.env.PORT;
const server = http.createServer(app);

async function startServer() {
  await mongoConnect();
  console.log('Mongo connected');
  server.listen(PORT, () => {
    console.log(`Listening to the port ${PORT}`);
  });
}

startServer();
