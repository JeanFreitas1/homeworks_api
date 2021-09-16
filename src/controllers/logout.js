import models from '../models';

const { User, RefreshToken } = models;

export default async function logout(req, res) {
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
