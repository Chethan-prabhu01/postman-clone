import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import collections, environments, history, requests, runner
from app.seed import seed_database

app = FastAPI(title="Postman Clone API", version="1.0.0")

# Read allowed origins from env var (set this in Render dashboard)
# Example: ALLOWED_ORIGINS=https://your-app.vercel.app,http://localhost:3000
raw_origins = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000"
)
allowed_origins = [o.strip() for o in raw_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

Base.metadata.create_all(bind=engine)

@app.on_event("startup")
async def startup_event():
    seed_database()

app.include_router(collections.router, prefix="/api/collections", tags=["collections"])
app.include_router(environments.router, prefix="/api/environments", tags=["environments"])
app.include_router(history.router, prefix="/api/history", tags=["history"])
app.include_router(requests.router, prefix="/api/requests", tags=["requests"])
app.include_router(runner.router, prefix="/api/runner", tags=["runner"])

@app.get("/")
def root():
    return {"message": "Postman Clone API is running", "allowed_origins": allowed_origins}

@app.get("/health")
def health():
    return {"status": "ok"}