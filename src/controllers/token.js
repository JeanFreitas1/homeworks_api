import models from '../models';
import JWTUtils from '../utils/jwt_utils';

const { User, RefreshToken } = models;

export default async function token(req, res) {
  const {
    jwt: { email, passingToken },
  } = req.body;

  const user = await User.findOne({
    where: { email },
    include: RefreshToken,
  });

  const savedToken = user.RefreshToken;

  if (!savedToken || !savedToken.token) {
    return res
      .status(401)
      .json({ success: false, message: 'You must log in first' });
  }

  if (savedToken !== passingToken) {
    user.RefreshToken.token = null;
    await user.RefreshToken.save();
    return res
      .status(401)
      .json({ success: false, message: 'Your token has expired' });
  }

  const payload = { email };
  const newAccessToken = JWTUtils.generateAccessToken(payload);
  return res
    .status(200)
    .json({ success: true, data: { accessToken: newAccessToken } });
}
