import jwt from 'jsonwebtoken';

import environment from '../config/environment';

export default class JWTUtils {
  static generateAccessToken(payload, options = {}) {
    const { expiresIn = 60 * 60 * 1 } = options; // 1h
    return jwt.sign(payload, environment.jwtAccessTokenSecret, { expiresIn });
  }
  static generateRefreshToken(payload, options = {}) {
    const { expiresIn = '7d' } = options; // 7d
    return jwt.sign(payload, environment.jwtRefreshTokenSecret, { expiresIn });
  }
  static verifyAccessToken(accessToken) {
    return jwt.verify(accessToken, environment.jwtAccessTokenSecret);
  }
  static verifyRefreshToken(accessToken) {
    return jwt.verify(accessToken, environment.jwtRefreshTokenSecret);
  }
}
