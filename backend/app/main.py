from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import collections, environments, history, requests, runner
from app.seed import seed_database

app = FastAPI(title="Postman Clone API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
    return {"message": "Postman Clone API is running"}

@app.get("/health")
def health():
    return {"status": "ok"}
