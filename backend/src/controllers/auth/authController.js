import * as authService from '../../services/auth/authService.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  res.status(201).json(result);
});

export const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  res.json(result);
});

export const verifyOtp = asyncHandler(async (req, res) => {
  const result = await authService.verifyOtp(req.body);
  res.json(result);
});

export const resendOtp = asyncHandler(async (req, res) => {
  const result = await authService.resendOtp(req.body);
  res.json(result);
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getProfile(req.user.id);
  res.json({ user });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await authService.updateProfile(req.user.id, req.body);
  res.json({ user });
});

export const generate2FA = asyncHandler(async (req, res) => {
  const result = await authService.generate2FA(req.user.id);
  res.json(result);
});

export const enable2FA = asyncHandler(async (req, res) => {
  const result = await authService.enable2FA(req.user.id, req.body.code);
  res.json(result);
});

export const disable2FA = asyncHandler(async (req, res) => {
  const result = await authService.disable2FA(req.user.id, req.body.code);
  res.json(result);
});

export const verifyLogin2FA = asyncHandler(async (req, res) => {
  const result = await authService.verifyLogin2FA(req.body.tempToken, req.body.code);
  res.json(result);
});
