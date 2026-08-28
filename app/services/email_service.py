import os
import smtplib
from email.message import EmailMessage
from dotenv import load_dotenv

load_dotenv()


def send_password_reset_email(
    recipient_email: str,
    reset_link: str,
) -> bool:
    """
    Send a password reset email using SMTP settings
    configured in the .env file.

    The backend is provider-independent.
    Gmail, Outlook, Zoho, or another SMTP provider
    can be used by changing only the .env settings.
    """

    smtp_host = os.getenv("SMTP_HOST")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_username = os.getenv("SMTP_USERNAME")
    smtp_password = os.getenv("SMTP_PASSWORD")

    # Check required configuration
    if not smtp_host:
        raise RuntimeError("SMTP_HOST is not configured.")

    if not smtp_username:
        raise RuntimeError("SMTP_USERNAME is not configured.")

    if not smtp_password:
        raise RuntimeError("SMTP_PASSWORD is not configured.")

    # Create email
    message = EmailMessage()

    message["Subject"] = "AI Recruitment System - Password Reset"
    message["From"] = smtp_username
    message["To"] = recipient_email

    message.set_content(
        f"""
Hello,

We received a request to reset your password for the AI Recruitment System.

Click the link below to reset your password:

{reset_link}

This password reset link will expire in 30 minutes.

If you did not request a password reset, you can safely ignore this email.

Regards,
AI Recruitment System
"""
    )

    # Connect to SMTP server
    with smtplib.SMTP(smtp_host, smtp_port) as server:

        # Secure the connection using STARTTLS
        server.starttls()

        # Login using credentials from .env
        server.login(
            smtp_username,
            smtp_password,
        )

        # Send email
        server.send_message(message)

    return True