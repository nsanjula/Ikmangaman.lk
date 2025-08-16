import os
import smtplib
from email.mime.text import MIMEText
from dotenv import load_dotenv

load_dotenv()

EMAIL_USER = os.getenv("EMAIL_USER")
EMAIL_PASS = os.getenv("EMAIL_PASS")
EMAIL_FROM = os.getenv("EMAIL_FROM", EMAIL_USER)

# def send_reset_email(to_email: str, reset_link: str):
#     subject = "Password Reset - Ikmangaman"
#     body = f"""Hello,
#
# Click the link below to reset your password:
# {reset_link}
#
# If you did not request this, please ignore this email.
# """
#
#     msg = MIMEText(body, "plain")
#     msg["From"] = EMAIL_FROM
#     msg["To"] = to_email
#     msg["Subject"] = subject
#
#     try:
#         with smtplib.SMTP("smtp.gmail.com", 587) as server:
#             server.starttls()
#             server.login(EMAIL_USER, EMAIL_PASS)
#             server.sendmail(EMAIL_FROM, to_email, msg.as_string())
#         print(f"Reset email sent to {to_email}")
#     except Exception as e:
#         print(f"Failed to send email: {e}")


def send_reset_email(to_email: str, reset_link: str):
    subject = "Password Reset Instructions – Ikmangaman"

    html_body = f"""
<html>
  <body style="font-family: 'Roboto Condensed', Arial, sans-serif; line-height:1.6; color:#333; background-color:#f9f9f9; padding:0; margin:0;">
    <div style="max-width:600px; margin:40px auto; background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.05);">
      
      <!-- Header -->
      <div style="background-color:#008080; padding:20px; text-align:center;">
        <h1 style="margin:0; color:white; font-size:24px; font-family: 'Roboto Condensed', Arial, sans-serif;">
          Ikmangaman
        </h1>
      </div>

      <!-- Body -->
      <div style="padding:30px;">
        <p style="font-size:16px;">Hello,</p>
        <p style="font-size:16px;">
          We received a request to reset your <strong>Ikmangaman</strong> account password.
        </p>

        <div style="text-align:center; margin:30px 0;">
          <a href="{reset_link}" 
             style="background-color:#008080; color:white; padding:14px 28px; 
                    text-decoration:none; border-radius:6px; font-weight:bold; font-size:16px; 
                    font-family: 'Roboto Condensed', Arial, sans-serif; display:inline-block;">
            Reset Password
          </a>
        </div>

        <p style="font-size:14px; color:#555;">
          If the button above doesn’t work, copy and paste this link into your browser:
        </p>
        <p style="font-size:14px; word-break:break-all;">
          <a href="{reset_link}" style="color:#008080; font-family: 'Roboto Condensed', Arial, sans-serif;">
            {reset_link}
          </a>
        </p>

        <p style="font-size:14px; color:#555;">
          If you didn’t request a password reset, please ignore this email. Your password will remain unchanged.
        </p>

        <p style="font-size:14px; margin-top:30px;">
          Best regards,<br>
          <strong>The Ikmangaman Support Team</strong>
        </p>
      </div>

      <!-- Footer -->
      <div style="background-color:#f1f1f1; padding:15px; text-align:center; font-size:12px; color:#777;">
        © {2025} Ikmangaman. All rights reserved.
      </div>
    </div>
  </body>
</html>
"""

    msg = MIMEText(html_body, "html")
    msg["From"] = EMAIL_FROM
    msg["To"] = to_email
    msg["Subject"] = subject

    try:
        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.starttls()
            server.login(EMAIL_USER, EMAIL_PASS)
            server.sendmail(EMAIL_FROM, to_email, msg.as_string())
        print(f"Reset email sent to {to_email}")
    except Exception as e:
        print(f"Failed to send email: {e}")
