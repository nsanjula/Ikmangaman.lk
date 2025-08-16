from datetime import timezone

from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException
from sqlalchemy.orm import Session
from starlette import status

from backend.database.db import get_db
from backend.models.users import User
from backend.models.password_reset import PasswordResetToken
from backend.schemas.auth import ForgotPasswordRequest, ResetPasswordRequest
from backend.utils.hashing import hash_password
from backend.utils.mailer import send_reset_email
from backend.utils.security import new_reset_token, now_utc, hash_token

router = APIRouter(
    prefix="/auth",
    tags=["auth"]
)

FRONTEND_URL = "http://localhost:8080"  # change to your frontend domain later

@router.post("/forgot-password")
def forgot_password(
    payload: ForgotPasswordRequest,
    background: BackgroundTasks,
    db: Session = Depends(get_db),
):
    # Always return the same response
    response = {"message": "If this email exists, we will send a reset link."}

    # Lookup user by email
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        return response

    # Generate reset token
    raw_token, token_hash, expires_at = new_reset_token()

    # Save to DB
    reset_entry = PasswordResetToken(
        user_id=user.user_id,
        token_hash=token_hash,
        expires_at=expires_at,
    )
    db.add(reset_entry)
    db.commit()

    # Build reset link
    reset_link = f"{FRONTEND_URL}/reset-password?token={raw_token}"
    send_reset_email(user.email, reset_link)

    # For now: print to console (later: send via email)
    print(f"[RESET LINK] Send to {user.email}: {reset_link}")

    return response

@router.post("/reset-password")
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    raw = payload.token.strip()  # remove any accidental whitespace/newline
    incoming_hash = hash_token(raw)  # hash it
    print(f"[DEBUG] incoming_hash={incoming_hash[:16]}...")

    # 1) Find token entry
    rec = db.query(PasswordResetToken).filter(
        PasswordResetToken.token_hash == incoming_hash
    ).first()

    if not rec:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired token"
        )

    exp = rec.expires_at
    if exp.tzinfo is None:
        exp = exp.replace(tzinfo=timezone.utc)

    if rec.used_at is not None or exp < now_utc():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired token"
        )

    # 2) Get user
    user = db.query(User).filter(User.user_id == rec.user_id).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid token")

    # 3) Update password
    user.password = hash_password(payload.new_password)

    # 4) Mark token as used
    rec.used_at = now_utc()
    db.commit()

    return {"message": "Password reset successful. You can now log in."}
