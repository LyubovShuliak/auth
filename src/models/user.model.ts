import { config } from 'dotenv';
import jwt from 'jsonwebtoken';

import { Exception } from '../entitties/Exception';
import { TokenEntity } from '../entitties/Token.entity';
import { User } from '../entitties/User.entity';
import { hashPassword } from '../services/crypto.service';
import { verifyHash } from '../services/crypto.service';
import { userDatabase } from './user.mongo';

config();
export async function verifyTokenAsync(token: string): Promise<Exception | User> {
  return await new Promise((resolve, reject) =>
    jwt.verify(token, process.env.JWTKEY as string, (error, decoded) =>
      error ? reject(new Exception(400, error.message)) : resolve(decoded as User)
    )
  );
}
export async function signTokenAsync(user: User): Promise<Exception | TokenEntity> {
  return await new Promise((resolve, reject) =>
    jwt.sign(
      { ...user },
      process.env.JWTKEY as string,

      (error, encoded) => {
        if (error || !encoded) {
          console.log(error, user);
          reject(new Exception(400, error?.message || 'No data'));
        } else {
          resolve(new TokenEntity(encoded as string));
        }
      }
    )
  );
}

export async function changePassword(
  { email, userName, password }: User,
  newPassword: string
): Promise<User | Exception> {
  const hash = await hashPassword(newPassword);
  const updatePassword = await userDatabase
    .findOneAndUpdate(
      {
        email,
        password
      },
      { password: hash },
      { projection: { __v: false, _id: false } }
    )
    .lean();

  if (!updatePassword) {
    return new Exception(400, 'Wrong password');
  } else {
    return new User(hash, email, userName);
  }
}

export async function findUserByEmail(email: string) {
  return userDatabase.findOne({ email: email }, { _id: false, __v: false }).lean();
}

export async function signUp(user: User): Promise<Exception | User> {
  const { password, email } = user;

  const userData = await findUserByEmail(email);

  if (userData) {
    return new Exception(
      400,
      'You already signed up with this email. Do you want to login with your credentials?'
    );
  }

  const newUser = {
    ...user
  };

  const hash = await hashPassword(password);
  try {
    return (await userDatabase
      .findOneAndUpdate(
        {
          ...newUser,
          password: hash
        },
        {
          ...newUser,
          password: hash
        },
        { upsert: true, projection: { __v: 0, _id: 0 }, returnDocument: 'after' }
      )
      .lean()) as User;
  } catch (err) {
    return new Exception(400, 'Something wrong, try again');
  }
}

export async function logIn(user: User): Promise<User | Exception> {
  if (!user.password || !user.email) {
    return new Exception(400, 'Insufficient data');
  }
  const userData = await findUserByEmail(user.email);

  if (!userData) {
    return new Exception(400, 'User not found');
  }

  const match = await verifyHash(user.password, userData.password);
  const { password, email, userName } = userData;
  if (match) {
    return new User(password, email, userName);
  } else {
    return new Exception(400, 'Wrong password');
  }
}
