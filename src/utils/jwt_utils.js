import jwt from 'jsonwebtoken';

import environment from '../config/environment';

export default class JWTUtils {
  static generateAccessToken(payload, options = {}) {
    const { expiresIn = 60 * 5 } = options; // 5min
    return jwt.sign(payload, environment.jwtAccessTokenSecret, { expiresIn });
  }
  static generateRefreshToken(payload, options = {}) {
    const { expiresIn = 60 * 60 } = options; // 1h
    return jwt.sign(payload, environment.jwtRefreshTokenSecret, { expiresIn });
  }
  static verifyAccessToken(accessToken) {
    return jwt.verify(accessToken, environment.jwtAccessTokenSecret);
  }
  static verifyRefreshToken(accessToken) {
    return jwt.verify(accessToken, environment.jwtRefreshTokenSecret);
  }
}
