"""Meeting transcript encryption using Fernet symmetric encryption."""
from __future__ import annotations

import base64

from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

from ..config import get_settings

settings = get_settings()


def _derive_key(password: str) -> bytes:
    salt = settings.encryption_salt.encode()
    kdf = PBKDF2HMAC(algorithm=hashes.SHA256(), length=32, salt=salt, iterations=480000)
    return base64.urlsafe_b64encode(kdf.derive(password.encode()))


def encrypt(data: bytes, password: str) -> bytes:
    f = Fernet(_derive_key(password))
    return f.encrypt(data)


def decrypt(token: bytes, password: str) -> bytes:
    f = Fernet(_derive_key(password))
    return f.decrypt(token)
