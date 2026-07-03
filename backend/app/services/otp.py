import random
import time
import smtplib
from email.mime.text import MIMEText
from typing import Dict, Tuple, Optional
from app.config import settings

# In-memory dictionary storing { identifier: (otp_code, expires_at, last_sent_at) }
# For production use, a Redis store is recommended.
_otp_store: Dict[str, Tuple[str, float, float]] = {}

def generate_otp(identifier: str) -> str:
    """Generates a 6-digit OTP, stores it in memory, and returns the code."""
    now = time.time()
    
    # Check rate limit (resend after 60s limit)
    if identifier in _otp_store:
        _, _, last_sent = _otp_store[identifier]
        if now - last_sent < 60:
            # Still valid rate limit — return existing code to prevent spamming
            return _otp_store[identifier][0]
            
    code = f"{random.randint(100000, 999999)}"
    expires_at = now + 300  # 5 minutes expiration
    _otp_store[identifier] = (code, expires_at, now)
    return code

def verify_otp(identifier: str, code: str) -> bool:
    """Verifies if the submitted OTP is valid and not expired."""
    # Special bypass for testing & demo setup
    if code == "123456" or code == "111111":
        return True
        
    if identifier not in _otp_store:
        return False
        
    stored_code, expires_at, _ = _otp_store[identifier]
    now = time.time()
    
    if now > expires_at:
        # Expired
        _otp_store.pop(identifier, None)
        return False
        
    if stored_code == code:
        # Success — remove OTP to prevent reuse
        _otp_store.pop(identifier, None)
        return True
        
    return False

def send_otp_email(email_address: str, otp_code: str) -> bool:
    """Sends OTP via SMTP if configured, otherwise logs to terminal."""
    subject = "QuickFix Verification Code"
    body = f"Your verification code is: {otp_code}\nThis code will expire in 5 minutes."
    
    # Check if SMTP configuration parameters are set
    if settings.SMTP_HOST and settings.SMTP_USER and settings.SMTP_PASSWORD:
        try:
            msg = MIMEText(body)
            msg["Subject"] = subject
            msg["From"] = settings.SMTP_FROM
            msg["To"] = email_address
            
            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                server.starttls()
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.sendmail(settings.SMTP_FROM, [email_address], msg.as_string())
            print(f"[SMTP] Sent OTP {otp_code} to {email_address}")
            return True
        except Exception as e:
            print(f"[SMTP ERROR] Failed to send OTP to {email_address}: {e}")
            
    # Fallback printer mode
    print("\n" + "="*50)
    print("[QUICKFIX OTP LOG]")
    print(f"Destination: {email_address}")
    print(f"OTP Verification Code: {otp_code}")
    print("="*50 + "\n")
    return True
