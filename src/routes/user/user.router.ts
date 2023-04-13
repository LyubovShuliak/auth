import express from 'express';

import { httpChangePassword, httpLoggin, httpSignUp } from './user.controler';

export const userRouter = express.Router();

userRouter.post('/signup', httpSignUp);
userRouter.post('/login', httpLoggin);
userRouter.post('/changepassword', httpChangePassword);
