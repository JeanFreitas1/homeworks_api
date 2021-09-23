import models from '../models';
import JWTUtils from '../utils/jwt_utils';
import EmailValidator from '../utils/email_validator_utils';
import { Op } from 'sequelize';

const { User, RefreshToken } = models;

export async function register(req, res) {
  const { email, username } = req.body;
  const user = await User.findOne({
    where: {
      [Op.or]: [{ username: username }, { email: email }],
    },
  });

  if (user) {
    return res
      .status(400)
      .json({ success: false, message: 'User already exists' });
  }
  // validating username
  if (EmailValidator.isValidEmail(username)) {
    return res.status(400).json({
      success: false,
      message: "Your username can't be a email format",
    });
  }
  //validating email
  if (!EmailValidator.isValidEmail(email)) {
    return res
      .status(400)
      .json({ success: false, message: 'Your email is invalid' });
  }

  const payload = { email };
  const accessToken = JWTUtils.generateAccessToken(payload);
  const refreshToken = JWTUtils.generateRefreshToken(payload);
  await User.createNewUser({ ...req.body, refreshToken });

  return res.status(200).json({
    success: true,
    message: 'User successfully registered',
    data: { accessToken, refreshToken },
  });
}

export async function login(req, res) {
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
    accessToken,
    refreshToken,
  });
}

export async function logout(req, res) {
  const {
    jwt: { email },
  } = req.body;
  const user = await User.findOne({
    where: { email },
    include: RefreshToken,
  });
  user.RefreshToken.token = null;
  await user.RefreshToken.save();
  return res
    .status(200)
    .json({ success: true, message: 'Successfully logout' });
}

export async function getAccessToken(req, res) {
  const {
    jwt: { email },
    passingToken,
  } = req.body;

  const user = await User.findOne({
    where: { email },
    include: RefreshToken,
  });

  const userRefreshToken = await user.getRefreshToken();

  if (!userRefreshToken || !userRefreshToken.token) {
    return res
      .status(401)
      .json({ success: false, message: 'You must log in first' });
  }

  if (userRefreshToken.token !== passingToken) {
    userRefreshToken.token = null;
    await userRefreshToken.save();
    return res
      .status(401)
      .json({ success: false, message: 'Your token has expired' });
  }

  const payload = { email };
  const newAccessToken = JWTUtils.generateAccessToken(payload);
  return res.status(200).json({ success: true, accessToken: newAccessToken });
}

export async function verifyAccessToken(req, res) {
  return res.status(200).json({ success: true });
}
