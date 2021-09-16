import express from 'express';
import login from '../controllers/login';
import register from '../controllers/register';
import logout from '../controllers/logout';
import token from '../controllers/token';
import requiresAuth from '../middlewares/requiresAuth';

const router = express.Router();

// API v1 Routes
router.post('/api/v1/login', login);
router.post('/api/v1/register', register);
router.post('/api/v1/logout', requiresAuth(), logout);
router.post('/api/v1/token', requiresAuth('refreshToken'), token);

export default router;
