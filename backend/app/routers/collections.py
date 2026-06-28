import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Collection, Folder, SavedRequest
from app.schemas import (
    CollectionCreate, CollectionUpdate, CollectionOut,
    FolderCreate, FolderOut,
    SavedRequestCreate, SavedRequestUpdate, SavedRequestOut
)

router = APIRouter()


# ── Collections ────────────────────────────────────────────────────────────────
@router.get("/", response_model=List[CollectionOut])
def list_collections(db: Session = Depends(get_db)):
    return db.query(Collection).order_by(Collection.created_at).all()


@router.post("/", response_model=CollectionOut)
def create_collection(payload: CollectionCreate, db: Session = Depends(get_db)):
    col = Collection(**payload.dict())
    db.add(col)
    db.commit()
    db.refresh(col)
    return col


@router.get("/{collection_id}", response_model=CollectionOut)
def get_collection(collection_id: int, db: Session = Depends(get_db)):
    col = db.query(Collection).filter(Collection.id == collection_id).first()
    if not col:
        raise HTTPException(status_code=404, detail="Collection not found")
    return col


@router.patch("/{collection_id}", response_model=CollectionOut)
def update_collection(collection_id: int, payload: CollectionUpdate, db: Session = Depends(get_db)):
    col = db.query(Collection).filter(Collection.id == collection_id).first()
    if not col:
        raise HTTPException(status_code=404, detail="Collection not found")
    for field, value in payload.dict(exclude_unset=True).items():
        setattr(col, field, value)
    db.commit()
    db.refresh(col)
    return col


@router.delete("/{collection_id}")
def delete_collection(collection_id: int, db: Session = Depends(get_db)):
    col = db.query(Collection).filter(Collection.id == collection_id).first()
    if not col:
        raise HTTPException(status_code=404, detail="Collection not found")
    db.delete(col)
    db.commit()
    return {"message": "Collection deleted"}


@router.get("/{collection_id}/requests", response_model=List[SavedRequestOut])
def list_collection_requests(collection_id: int, db: Session = Depends(get_db)):
    return db.query(SavedRequest).filter(SavedRequest.collection_id == collection_id).all()


# ── Folders ────────────────────────────────────────────────────────────────────
@router.post("/{collection_id}/folders", response_model=FolderOut)
def create_folder(collection_id: int, payload: FolderCreate, db: Session = Depends(get_db)):
    folder = Folder(name=payload.name, collection_id=collection_id)
    db.add(folder)
    db.commit()
    db.refresh(folder)
    return folder


@router.delete("/{collection_id}/folders/{folder_id}")
def delete_folder(collection_id: int, folder_id: int, db: Session = Depends(get_db)):
    folder = db.query(Folder).filter(Folder.id == folder_id, Folder.collection_id == collection_id).first()
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")
    db.delete(folder)
    db.commit()
    return {"message": "Folder deleted"}


# ── Full tree (collection + folders + requests) ────────────────────────────────
@router.get("/{collection_id}/tree")
def get_collection_tree(collection_id: int, db: Session = Depends(get_db)):
    col = db.query(Collection).filter(Collection.id == collection_id).first()
    if not col:
        raise HTTPException(status_code=404, detail="Collection not found")

    folders = db.query(Folder).filter(Folder.collection_id == collection_id).all()
    requests = db.query(SavedRequest).filter(SavedRequest.collection_id == collection_id).all()

    def req_to_dict(r):
        return {
            "id": r.id,
            "name": r.name,
            "method": r.method,
            "url": r.url,
            "headers": r.headers,
            "params": r.params,
            "body_type": r.body_type,
            "body_content": r.body_content,
            "auth_type": r.auth_type,
            "auth_data": r.auth_data,
            "folder_id": r.folder_id,
            "collection_id": r.collection_id,
        }

    folder_list = []
    for f in folders:
        folder_requests = [req_to_dict(r) for r in requests if r.folder_id == f.id]
        folder_list.append({"id": f.id, "name": f.name, "requests": folder_requests})

    root_requests = [req_to_dict(r) for r in requests if r.folder_id is None]

    return {
        "id": col.id,
        "name": col.name,
        "description": col.description,
        "color": col.color,
        "folders": folder_list,
        "requests": root_requests,
    }
