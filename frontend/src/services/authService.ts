import api from "./api";
import axios from "axios";
import type { AuthResponse, RegisterResponse, RegisterPayload, LoginPayload, VerifyEmailPayload, ResendVerificationPayload, ForgotPasswordPayload, ResetPasswordPayload, ChangePasswordPayload, User } from "@/types/auth";
import type { MessageResponse } from "@/types/common";

export const authService = {
  register: (data: RegisterPayload) =>
    api.post<RegisterResponse>("/auth/register", data),

  login: (data: LoginPayload) =>
    api.post<AuthResponse>("/auth/login", data),

  logout: () =>
    api.post<MessageResponse>("/auth/logout"),

  refresh: (refreshToken: string) =>
    axios.post<AuthResponse>("/api/v1/auth/refresh", { refresh_token: refreshToken }),

  getMe: () =>
    api.get<User>("/auth/me"),

  verifyEmail: (data: VerifyEmailPayload) =>
    api.post<MessageResponse>("/auth/verify-email", data),

  resendVerification: (data: ResendVerificationPayload) =>
    api.post<MessageResponse>("/auth/resend-verification", data),

  forgotPassword: (data: ForgotPasswordPayload) =>
    api.post<MessageResponse>("/auth/forgot-password", data),

  resetPassword: (data: ResetPasswordPayload) =>
    api.post<MessageResponse>("/auth/reset-password", data),

  changePassword: (data: ChangePasswordPayload) =>
    api.post<MessageResponse>("/auth/change-password", data),
};
