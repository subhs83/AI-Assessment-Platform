import re
import secrets
import string
from passlib.hash import scrypt


def hash_password(password: str) -> str:
    return scrypt.hash(password)


def verify_password(password: str, stored_hash: str) -> bool:
    return scrypt.verify(password, stored_hash)


def validate_password_strength(password):
    if len(password) < 8:
        return "Password must be at least 8 characters long."

    if not re.search(r"[A-Z]", password):
        return "Password must contain at least one uppercase letter."

    if not re.search(r"[a-z]", password):
        return "Password must contain at least one lowercase letter."

    if not re.search(r"\d", password):
        return "Password must contain at least one number."

    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        return "Password must contain at least one special character."

    return None


def generate_temp_password(length=10):
    characters = string.ascii_letters + string.digits + "!@#$%^&*"
    return ''.join(secrets.choice(characters) for _ in range(length))