import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import SavedRequest
from app.schemas import SavedRequestCreate, SavedRequestUpdate, SavedRequestOut

router = APIRouter()


@router.post("/", response_model=SavedRequestOut)
def create_request(payload: SavedRequestCreate, db: Session = Depends(get_db)):
    req = SavedRequest(
        name=payload.name,
        method=payload.method,
        url=payload.url,
        headers=json.dumps([h.dict() for h in (payload.headers or [])]),
        params=json.dumps([p.dict() for p in (payload.params or [])]),
        body_type=payload.body_type or "none",
        body_content=payload.body_content,
        auth_type=payload.auth_type or "none",
        auth_data=json.dumps(payload.auth_data or {}),
        collection_id=payload.collection_id,
        folder_id=payload.folder_id,
    )
    db.add(req)
    db.commit()
    db.refresh(req)
    return req


@router.get("/{request_id}", response_model=SavedRequestOut)
def get_request(request_id: int, db: Session = Depends(get_db)):
    req = db.query(SavedRequest).filter(SavedRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    return req


@router.patch("/{request_id}", response_model=SavedRequestOut)
def update_request(request_id: int, payload: SavedRequestUpdate, db: Session = Depends(get_db)):
    req = db.query(SavedRequest).filter(SavedRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")

    data = payload.dict(exclude_unset=True)
    if "headers" in data and data["headers"] is not None:
        data["headers"] = json.dumps([h.dict() for h in data["headers"]])
    if "params" in data and data["params"] is not None:
        data["params"] = json.dumps([p.dict() for p in data["params"]])
    if "auth_data" in data and data["auth_data"] is not None:
        data["auth_data"] = json.dumps(data["auth_data"])

    for field, value in data.items():
        setattr(req, field, value)

    db.commit()
    db.refresh(req)
    return req


@router.delete("/{request_id}")
def delete_request(request_id: int, db: Session = Depends(get_db)):
    req = db.query(SavedRequest).filter(SavedRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    db.delete(req)
    db.commit()
    return {"message": "Request deleted"}
