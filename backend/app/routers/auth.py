from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
import bcrypt
from jose import jwt, JWTError
from datetime import datetime, timedelta
import os

from app.database import get_db
from app.models import User

router = APIRouter(prefix="/auth", tags=["auth"])

SECRET_KEY = os.getenv("SECRET_KEY", "storywriter-secret-change-me")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 30

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8')[:72], bcrypt.gensalt()).decode('utf-8')

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode('utf-8')[:72], hashed.encode('utf-8'))

def create_access_token(user_id: int) -> str:
    expire = datetime.utcnow() + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    payload = {"sub": str(user_id), "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(authorization: str = Header(None), db: Session = Depends(get_db)) -> User:
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization header")
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(status_code=401, detail="Invalid authorization scheme")
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(payload.get("sub"))
    except (JWTError, ValueError):
        raise HTTPException(status_code=401, detail="Invalid token")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

@router.post("/register")
def register(username: str, password: str, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.username == username).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already taken")
    user = User(username=username, password=hash_password(password))
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token(user.id)
    return {"token": token, "user_id": user.id, "username": user.username}

@router.post("/login")
def login(username: str, password: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == username).first()
    if not user or not verify_password(password, user.password):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    token = create_access_token(user.id)
    return {"token": token, "user_id": user.id, "username": user.username}

@router.get("/me")
def me(current_user: User = Depends(get_current_user)):
    return {"user_id": current_user.id, "username": current_user.username}
