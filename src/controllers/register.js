import models from '../models';
import JWTUtils from '../utils/jwt_utils';
import EmailValidator from '../utils/email_validator_utils';
import { Op } from 'sequelize';

const { User } = models;

export default async function register(req, res) {
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
    return res
      .status(400)
      .json({
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
