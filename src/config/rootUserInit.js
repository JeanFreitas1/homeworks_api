import models from '../models';
import JWTUtils from '../utils/jwt_utils';
const { User } = models;

export default async function rootUserInit() {
  if (process.env.SYSTEM_INITIALIZED) {
    if (
      process.env.ROOT_USERNAME &&
      process.env.ROOT_PASSWORD &&
      process.env.ROOT_EMAIL
    ) {
      const username = process.env.ROOT_USERNAME;
      const password = process.env.ROOT_PASSWORD;
      const email = process.env.ROOT_EMAIL;
      const firstName = 'Root';
      const lastName = 'User';
      const roles = ['root'];
      const payload = { email };
      const refreshToken = JWTUtils.generateRefreshToken(payload);
      await User.createNewUser({
        username,
        password,
        roles,
        email,
        firstName,
        lastName,
        refreshToken,
      });
      console.log('Root User inserted successfully');
    } else {
      // checking if all env variables are setted correctly
      console.log(
        'Root user was not set because env variables are not set (ROOT_USERNAME, ROOT_PASSWORD,ROOT_EMAIL)'
      );
    }
  } else {
    // checking if we already initialized this server
    // console.log('Root user already initialized!');
  }
}
