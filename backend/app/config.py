import os

class Settings:
    PROJECT_NAME: str = "CoreCode"
    PROJECT_FULL_NAME: str = "CoreCode – Online Coding Assessment & Evaluation Platform"
    TAGLINE: str = "Code. Solve. Prove."
    
    SECRET_KEY: str = os.getenv("SECRET_KEY", "corecode-super-secret-jwt-key-2026-safe-production-key-change-me")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24
    
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./corecode.db")
    
    INITIAL_SUPERADMIN_EMAIL: str = "harishprakash0506@gmail.com"
    INITIAL_SUPERADMIN_PASSWORD: str = os.getenv("INITIAL_SUPERADMIN_PASSWORD", "Admin@CoreCode2026!")

settings = Settings()
