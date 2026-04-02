import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Literal, Optional

import aiosmtplib

from app.core.config import config

logger = logging.getLogger(__name__)

Language = Literal["kk", "ru", "en"]


class EmailService:
    def __init__(self):
        self.smtp_host = config.MAIL_SERVER
        self.smtp_port = config.MAIL_PORT
        self.username = config.MAIL_USERNAME
        self.password = config.MAIL_PASSWORD
        self.from_email = config.MAIL_FROM or config.MAIL_USERNAME
        self.app_name = config.APPLICATION_NAME

    # ── TRANSPORT ───────────────────────────────────────────────────────

    async def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        plain_content: Optional[str] = None,
    ) -> bool:
        try:
            logger.info(
                "Sending email to %s via %s:%s", to_email, self.smtp_host, self.smtp_port
            )
            message = MIMEMultipart("alternative")
            message["From"] = self.from_email
            message["To"] = to_email
            message["Subject"] = subject

            if plain_content:
                message.attach(MIMEText(plain_content, "plain"))
            message.attach(MIMEText(html_content, "html"))

            await aiosmtplib.send(
                message,
                hostname=self.smtp_host,
                port=self.smtp_port,
                username=self.username,
                password=self.password,
                start_tls=True,
                timeout=30,
            )
            logger.info("Email sent successfully to %s", to_email)
            return True
        except Exception as e:
            logger.error(
                "Failed to send email to %s: %s (type: %s)", to_email, e, type(e).__name__
            )
            return False

    # ── VERIFICATION ────────────────────────────────────────────────────

    async def send_verification_email(
        self,
        to_email: str,
        verification_code: str,
        user_id: int,
        language: Language = "en",
    ) -> bool:
        subject = f"{self.app_name} - Verify Your Email"

        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #333; text-align: center;">{self.app_name}</h1>
            <p>Thank you for registering. Please verify your email using the code below:</p>
            <div style="text-align: center; margin: 30px 0;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px;
                             padding: 15px 30px; background: #f0f0f0; border-radius: 8px;">
                    {verification_code}
                </span>
            </div>
            <p style="color: #666;">This code will expire in 60 minutes.</p>
            <p style="color: #999; font-size: 12px;">
                If you didn't create an account with {self.app_name}, please ignore this email.
            </p>
        </body>
        </html>
        """

        plain_content = (
            f"Welcome to {self.app_name}!\n\n"
            f"Your verification code: {verification_code}\n\n"
            f"This code will expire in 60 minutes."
        )

        logger.info("Sending verification email to %s", to_email)
        return await self.send_email(to_email, subject, html_content, plain_content)

    # ── PASSWORD RESET ──────────────────────────────────────────────────

    async def send_password_reset_email(
        self, to_email: str, reset_link: str, language: Language = "en"
    ) -> bool:
        subject = f"{self.app_name} - Password Reset"

        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #333; text-align: center;">{self.app_name}</h1>
            <p>We received a request to reset your password. Click the button below to set a new password:</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="{reset_link}"
                   style="display: inline-block; padding: 14px 32px; background: #4F46E5;
                          color: #ffffff; text-decoration: none; font-size: 16px;
                          font-weight: bold; border-radius: 8px;">
                    Reset Password
                </a>
            </div>
            <p style="color: #666;">This link will expire in 1 hour.</p>
            <p style="color: #999; font-size: 12px;">
                If the button doesn't work, copy and paste this link into your browser:<br/>
                <a href="{reset_link}" style="color: #4F46E5;">{reset_link}</a>
            </p>
            <p style="color: #999; font-size: 12px;">
                If you didn't request a password reset, please ignore this email.
            </p>
        </body>
        </html>
        """

        plain_content = (
            f"{self.app_name} - Password Reset\n\n"
            f"Click the link below to reset your password:\n"
            f"{reset_link}\n\n"
            f"This link will expire in 1 hour."
        )

        logger.info("Sending password reset email to %s", to_email)
        return await self.send_email(to_email, subject, html_content, plain_content)

    # ── WELCOME ─────────────────────────────────────────────────────────

    async def send_welcome_email(
        self, to_email: str, user_name: str = "", language: Language = "en"
    ) -> bool:
        subject = f"Welcome to {self.app_name}!"

        greeting = f" {user_name}" if user_name else ""

        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #333; text-align: center;">Welcome to {self.app_name}!</h1>
            <p>Hello{greeting},</p>
            <p>Your email has been verified successfully!</p>
            <p>You can now enjoy all the features of {self.app_name}.</p>
            <p style="color: #666;">Happy travels!</p>
        </body>
        </html>
        """

        plain_content = (
            f"Welcome to {self.app_name}!\n\n"
            f"Hello{greeting},\n"
            f"Your email has been verified successfully!\n"
            f"Happy travels!"
        )

        logger.info("Sending welcome email to %s", to_email)
        return await self.send_email(to_email, subject, html_content, plain_content)


email_service = EmailService()
