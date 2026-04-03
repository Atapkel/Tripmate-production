import asyncio
import logging
import time
from typing import Literal, Optional

import requests

from app.core.config import config

logger = logging.getLogger(__name__)

Language = Literal["kk", "ru", "en"]


class EmailService:
    def __init__(self):
        self.api_key = config.MAILGUN_API_KEY
        self.domain = config.MAILGUN_DOMAIN
        self.from_email = config.MAIL_FROM
        self.app_name = config.APPLICATION_NAME
        self.base_url = f"https://api.mailgun.net/v3/{self.domain}/messages"

        # Log configuration status at startup
        if not self.api_key:
            logger.error("MAILGUN_API_KEY is not configured!")
        if not self.domain:
            logger.error("MAILGUN_DOMAIN is not configured!")
        if not self.from_email:
            logger.error("MAIL_FROM is not configured!")
        logger.info(
            "EmailService initialized — domain=%s, from=%s, api_key_set=%s",
            self.domain, self.from_email, bool(self.api_key),
        )

    # ── TRANSPORT ───────────────────────────────────────────────────────

    async def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        plain_content: Optional[str] = None,
    ) -> bool:
        logger.info(
            "send_email START — to=%s, subject='%s', has_plain=%s",
            to_email, subject, plain_content is not None,
        )

        if not self.api_key or not self.domain:
            logger.error(
                "send_email ABORTED — missing config: api_key_set=%s, domain=%s",
                bool(self.api_key), self.domain,
            )
            return False

        try:
            data = {
                "from": self.from_email,
                "to": [to_email],
                "subject": subject,
                "html": html_content,
            }
            if plain_content:
                data["text"] = plain_content

            start = time.monotonic()
            response = await asyncio.to_thread(
                requests.post,
                self.base_url,
                auth=("api", self.api_key),
                data=data,
            )
            elapsed_ms = (time.monotonic() - start) * 1000

            logger.info(
                "send_email RESPONSE — to=%s, status_code=%s, elapsed=%.0fms, body=%s",
                to_email, response.status_code, elapsed_ms, response.text,
            )

            response.raise_for_status()

            logger.info("send_email SUCCESS — to=%s, subject='%s'", to_email, subject)
            return True

        except requests.exceptions.HTTPError as e:
            logger.error(
                "send_email FAILED (HTTP) — to=%s, status_code=%s, response=%s, error=%s",
                to_email, e.response.status_code if e.response is not None else "N/A",
                e.response.text if e.response is not None else "N/A", e,
            )
            return False
        except requests.exceptions.ConnectionError as e:
            logger.error(
                "send_email FAILED (Connection) — to=%s, error=%s",
                to_email, e,
            )
            return False
        except requests.exceptions.Timeout as e:
            logger.error(
                "send_email FAILED (Timeout) — to=%s, error=%s",
                to_email, e,
            )
            return False
        except Exception as e:
            logger.error(
                "send_email FAILED (Unexpected) — to=%s, error=%s, type=%s",
                to_email, e, type(e).__name__,
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
        logger.info(
            "send_verification_email — to=%s, user_id=%s, code=%s",
            to_email, user_id, verification_code,
        )
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

        result = await self.send_email(to_email, subject, html_content, plain_content)
        logger.info(
            "send_verification_email RESULT — to=%s, user_id=%s, sent=%s",
            to_email, user_id, result,
        )
        return result

    # ── PASSWORD RESET ──────────────────────────────────────────────────

    async def send_password_reset_email(
        self, to_email: str, reset_link: str, language: Language = "en"
    ) -> bool:
        logger.info("send_password_reset_email — to=%s", to_email)
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

        result = await self.send_email(to_email, subject, html_content, plain_content)
        logger.info(
            "send_password_reset_email RESULT — to=%s, sent=%s",
            to_email, result,
        )
        return result

    # ── WELCOME ─────────────────────────────────────────────────────────

    async def send_welcome_email(
        self, to_email: str, user_name: str = "", language: Language = "en"
    ) -> bool:
        logger.info("send_welcome_email — to=%s, user_name='%s'", to_email, user_name)
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

        result = await self.send_email(to_email, subject, html_content, plain_content)
        logger.info(
            "send_welcome_email RESULT — to=%s, sent=%s",
            to_email, result,
        )
        return result


email_service = EmailService()
