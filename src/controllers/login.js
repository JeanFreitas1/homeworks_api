import models from '../models';
import JWTUtils from '../utils/jwt_utils';
import { Op } from 'sequelize';

const { User } = models;

export default async function login(req, res) {
  // check for email or username - called login
  const { login, password } = req.body;

  const user = await User.scope('withPassword').findOne({
    where: {
      [Op.or]: [{ username: login }, { email: login }],
    },
  });

  if (!user || !(await user.comparePasswords(password))) {
    return res
      .status(401)
      .json({ success: false, message: 'Invalid credentials' });
  }

  const payload = { email: user.email };
  const accessToken = JWTUtils.generateAccessToken(payload);
  const refreshToken = JWTUtils.generateRefreshToken(payload);

  const userRefreshToken = await user.getRefreshToken();

  userRefreshToken.token = refreshToken;

  await userRefreshToken.save();

  return res.status(200).json({
    success: true,
    message: 'Successfully logged in',
    data: {
      accessToken,
      refreshToken,
    },
  });
}
