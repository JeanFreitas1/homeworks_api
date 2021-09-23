import express from 'express';

import {
  login,
  register,
  logout,
  getAccessToken,
  verifyAccessToken,
} from '../controllers/authentication';
//middleware to authenticate
import requiresAuth from '../middlewares/requiresAuth';
// upload system
import getAllFiles from '../controllers/getAllFiles';
import getSingleFile from '../controllers/getSingleFile';
import deleteSingleFile from '../controllers/deleteSingleFile';
import uploadFile from '../controllers/uploadFile';
//Multipart upload system
import {
  getUploadId,
  getUploadPart,
  completeUpload,
} from '../controllers/uploadMultipart';

const router = express.Router();

// API v1 Routes Authentication
router.post('/api/v1/login', login);
router.post('/api/v1/register', requiresAuth(), register);
router.post('/api/v1/logout', requiresAuth(), logout);
router.post('/api/v1/token', requiresAuth('refreshToken'), getAccessToken);
router.get('/api/v1/verify', requiresAuth(), verifyAccessToken);

//multipart upload routes
router.post('/api/v1/files/getUploadId', requiresAuth(), getUploadId);
router.post('/api/v1/files/getUploadPart', requiresAuth(), getUploadPart);
router.post('/api/v1/files/completeUpload', requiresAuth(), completeUpload);

//files
router.get('/api/v1/files/', requiresAuth(), getAllFiles);
router.get('/api/v1/files/:filename', requiresAuth(), getSingleFile);
router.delete('/api/v1/files/:filename', requiresAuth(), deleteSingleFile);
router.post('/api/v1/files/upload', requiresAuth(), uploadFile);

export default router;
