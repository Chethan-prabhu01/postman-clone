import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Environment, EnvironmentVariable
from app.schemas import EnvironmentCreate, EnvironmentUpdate, EnvironmentOut

router = APIRouter()


@router.get("/", response_model=List[EnvironmentOut])
def list_environments(db: Session = Depends(get_db)):
    return db.query(Environment).order_by(Environment.created_at).all()


@router.post("/", response_model=EnvironmentOut)
def create_environment(payload: EnvironmentCreate, db: Session = Depends(get_db)):
    env = Environment(name=payload.name)
    db.add(env)
    db.flush()

    for var in (payload.variables or []):
        v = EnvironmentVariable(
            environment_id=env.id,
            key=var.key,
            value=var.value,
            is_secret=var.is_secret,
            enabled=var.enabled,
        )
        db.add(v)

    db.commit()
    db.refresh(env)
    return env


@router.get("/{env_id}", response_model=EnvironmentOut)
def get_environment(env_id: int, db: Session = Depends(get_db)):
    env = db.query(Environment).filter(Environment.id == env_id).first()
    if not env:
        raise HTTPException(status_code=404, detail="Environment not found")
    return env


@router.patch("/{env_id}", response_model=EnvironmentOut)
def update_environment(env_id: int, payload: EnvironmentUpdate, db: Session = Depends(get_db)):
    env = db.query(Environment).filter(Environment.id == env_id).first()
    if not env:
        raise HTTPException(status_code=404, detail="Environment not found")

    if payload.name is not None:
        env.name = payload.name

    if payload.variables is not None:
        # Delete existing and recreate
        db.query(EnvironmentVariable).filter(EnvironmentVariable.environment_id == env_id).delete()
        for var in payload.variables:
            v = EnvironmentVariable(
                environment_id=env.id,
                key=var.key,
                value=var.value,
                is_secret=var.is_secret,
                enabled=var.enabled,
            )
            db.add(v)

    db.commit()
    db.refresh(env)
    return env


@router.delete("/{env_id}")
def delete_environment(env_id: int, db: Session = Depends(get_db)):
    env = db.query(Environment).filter(Environment.id == env_id).first()
    if not env:
        raise HTTPException(status_code=404, detail="Environment not found")
    db.delete(env)
    db.commit()
    return {"message": "Environment deleted"}


@router.post("/{env_id}/activate")
def activate_environment(env_id: int, db: Session = Depends(get_db)):
    # Deactivate all
    db.query(Environment).update({"is_active": False})
    # Activate selected
    env = db.query(Environment).filter(Environment.id == env_id).first()
    if not env:
        raise HTTPException(status_code=404, detail="Environment not found")
    env.is_active = True
    db.commit()
    return {"message": "Environment activated"}
