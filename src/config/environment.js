export default {
  port: parseInt(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV,
  saltRounds: parseInt(process.env.SALT_ROUNDS),
  jwtAccessTokenSecret: process.env.JWT_ACCESS_TOKEN_SECRET,
  jwtRefreshTokenSecret: process.env.JWT_REFRESH_TOKEN_SECRET,
};
