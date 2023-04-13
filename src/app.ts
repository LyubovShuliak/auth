import bodyParser from 'body-parser';
import cors from 'cors';
import { config } from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import path from 'path';

import { userRouter } from './routes/user/user.router';

config();

export const app = express();

app.set('trust proxy', 1);

app.use(cors({ origin: '*' }));
app.use(helmet());

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/', userRouter);
