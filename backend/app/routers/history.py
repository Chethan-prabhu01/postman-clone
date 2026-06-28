from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import RequestHistory
from app.schemas import HistoryOut

router = APIRouter()


@router.get("/", response_model=List[HistoryOut])
def list_history(limit: int = 100, db: Session = Depends(get_db)):
    return (
        db.query(RequestHistory)
        .order_by(RequestHistory.created_at.desc())
        .limit(limit)
        .all()
    )


@router.get("/{history_id}", response_model=HistoryOut)
def get_history_entry(history_id: int, db: Session = Depends(get_db)):
    entry = db.query(RequestHistory).filter(RequestHistory.id == history_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="History entry not found")
    return entry


@router.delete("/{history_id}")
def delete_history_entry(history_id: int, db: Session = Depends(get_db)):
    entry = db.query(RequestHistory).filter(RequestHistory.id == history_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="History entry not found")
    db.delete(entry)
    db.commit()
    return {"message": "History entry deleted"}


@router.delete("/")
def clear_history(db: Session = Depends(get_db)):
    db.query(RequestHistory).delete()
    db.commit()
    return {"message": "History cleared"}
