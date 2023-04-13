import { config } from 'dotenv';
import { Request, Response } from 'express';

import { Exception } from '../../entitties/Exception';
import { User } from '../../entitties/User.entity';
import {
  findUserByEmail,
  logIn,
  signTokenAsync,
  signUp,
  verifyTokenAsync
} from '../../models/user.model';
import { changePassword } from '../../models/user.model';
import { hashPassword } from '../../services/crypto.service';

config();

export async function httpSignUp(req: Request, res: Response) {
  const user = req.body;

  const { password, userName, email } = user;

  if (!password || !userName || !email) {
    return res.status(400).json({
      error: 'Missing one or more required credentials'
    });
  }

  const response = await signUp(user);

  if (response instanceof Exception) {
    return res.status(response.code).json(response);
  }

  try {
    const tokenResponse = await signTokenAsync(response);
    if (tokenResponse instanceof Exception) {
      return res.status(tokenResponse.code).json(tokenResponse);
    } else {
      return res.status(200).json(tokenResponse);
    }
  } catch (error) {
    res.status(400).send({ error });
  }
}

export async function httpLoggin(req: Request, res: Response) {
  const user = req.body;

  if (!user.password || !user.email) {
    return res.status(400).json({
      error: 'Missing one or more required credentials'
    });
  }

  const response = await logIn(user);
  if (response instanceof Exception) {
    return res.status(400).send(response);
  }
  const tokenResponse = await signTokenAsync(response);
  if (tokenResponse instanceof Exception) {
    return res.status(tokenResponse.code).json(tokenResponse);
  } else {
    return res.status(200).json(tokenResponse);
  }
}

export async function httpChangePassword(req: Request, res: Response) {
  const password = req.body.password;
  const [type, token] = req.headers['authorization']?.split(' ') ?? [];

  const hash = await hashPassword(password);

  if (type !== 'Bearer' || !token) {
    return res.status(401).json('Token not provided');
  }

  try {
    const userData = await verifyTokenAsync(token);

    if (userData instanceof Exception) {
      return res.status(userData.code).json(userData);
    }
    const changePasswordResponse = await changePassword(userData, password);
    if (changePasswordResponse instanceof Exception) {
      return res.status(changePasswordResponse.code).json(changePasswordResponse);
    } else {
      try {
        const { email, userName } = changePasswordResponse;
        const tokenResponse = await signTokenAsync(new User(hash, email, userName));
        if (tokenResponse instanceof Exception) {
          console.log(tokenResponse);
          return res.status(tokenResponse.code).json(tokenResponse);
        } else {
          console.log(tokenResponse);
          return res.status(200).json(tokenResponse);
        }
      } catch (error) {
        console.log(error);
        if (error instanceof Error) {
          res.status(400).send({ error: error.message });
        }
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(400).send(error);
  }
}
