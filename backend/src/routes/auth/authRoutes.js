import { Router } from 'express';
import * as authController from '../../controllers/auth/authController.js';
import { authenticate } from '../../middleware/auth/authMiddleware.js';
import { validate } from '../../middleware/validate.js';
import { registerValidator, loginValidator, verifyOtpValidator, resendOtpValidator } from '../validators.js';

const router = Router();

router.post('/register', registerValidator, validate, authController.register);
router.post('/login', loginValidator, validate, authController.login);
router.post('/verify-otp', verifyOtpValidator, validate, authController.verifyOtp);
router.post('/resend-otp', resendOtpValidator, validate, authController.resendOtp);
router.get('/me', authenticate, authController.getMe);
router.put('/profile', authenticate, authController.updateProfile);

// 2FA Routes
router.post('/2fa/generate', authenticate, authController.generate2FA);
router.post('/2fa/enable', authenticate, authController.enable2FA);
router.post('/2fa/disable', authenticate, authController.disable2FA);
router.post('/login/verify-2fa', authController.verifyLogin2FA);

export default router;
