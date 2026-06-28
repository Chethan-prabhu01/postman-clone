from pydantic import BaseModel
from typing import Optional, List, Any, Dict
from datetime import datetime


# ── KeyValue pair ──────────────────────────────────────────────────────────────
class KeyValuePair(BaseModel):
    key: str
    value: str
    enabled: bool = True
    description: Optional[str] = None


# ── Auth ───────────────────────────────────────────────────────────────────────
class AuthData(BaseModel):
    token: Optional[str] = None
    username: Optional[str] = None
    password: Optional[str] = None


# ── Collection ─────────────────────────────────────────────────────────────────
class CollectionCreate(BaseModel):
    name: str
    description: Optional[str] = None
    color: Optional[str] = "#FF6C37"


class CollectionUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    color: Optional[str] = None


class CollectionOut(BaseModel):
    id: int
    name: str
    description: Optional[str]
    color: str
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


# ── Folder ─────────────────────────────────────────────────────────────────────
class FolderCreate(BaseModel):
    name: str
    collection_id: int


class FolderOut(BaseModel):
    id: int
    name: str
    collection_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ── Saved Request ──────────────────────────────────────────────────────────────
class SavedRequestCreate(BaseModel):
    name: str
    method: str = "GET"
    url: str
    headers: Optional[List[KeyValuePair]] = []
    params: Optional[List[KeyValuePair]] = []
    body_type: Optional[str] = "none"
    body_content: Optional[str] = None
    auth_type: Optional[str] = "none"
    auth_data: Optional[Dict[str, Any]] = {}
    collection_id: Optional[int] = None
    folder_id: Optional[int] = None


class SavedRequestUpdate(BaseModel):
    name: Optional[str] = None
    method: Optional[str] = None
    url: Optional[str] = None
    headers: Optional[List[KeyValuePair]] = None
    params: Optional[List[KeyValuePair]] = None
    body_type: Optional[str] = None
    body_content: Optional[str] = None
    auth_type: Optional[str] = None
    auth_data: Optional[Dict[str, Any]] = None
    folder_id: Optional[int] = None


class SavedRequestOut(BaseModel):
    id: int
    name: str
    method: str
    url: str
    headers: str
    params: str
    body_type: str
    body_content: Optional[str]
    auth_type: str
    auth_data: str
    collection_id: Optional[int]
    folder_id: Optional[int]
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


# ── Environment ────────────────────────────────────────────────────────────────
class EnvironmentVariableCreate(BaseModel):
    key: str
    value: Optional[str] = ""
    is_secret: bool = False
    enabled: bool = True


class EnvironmentCreate(BaseModel):
    name: str
    variables: Optional[List[EnvironmentVariableCreate]] = []


class EnvironmentUpdate(BaseModel):
    name: Optional[str] = None
    variables: Optional[List[EnvironmentVariableCreate]] = None


class EnvironmentVariableOut(BaseModel):
    id: int
    key: str
    value: Optional[str]
    is_secret: bool
    enabled: bool

    class Config:
        from_attributes = True


class EnvironmentOut(BaseModel):
    id: int
    name: str
    is_active: bool
    variables: List[EnvironmentVariableOut]
    created_at: datetime

    class Config:
        from_attributes = True


# ── Runner ─────────────────────────────────────────────────────────────────────
class RunnerRequest(BaseModel):
    method: str
    url: str
    headers: Optional[List[KeyValuePair]] = []
    params: Optional[List[KeyValuePair]] = []
    body_type: Optional[str] = "none"
    body_content: Optional[str] = None
    auth_type: Optional[str] = "none"
    auth_data: Optional[Dict[str, Any]] = {}
    environment_id: Optional[int] = None


class RunnerResponse(BaseModel):
    status: int
    status_text: str
    time_ms: float
    size_bytes: int
    headers: Dict[str, str]
    body: str
    history_id: int


# ── History ────────────────────────────────────────────────────────────────────
class HistoryOut(BaseModel):
    id: int
    method: str
    url: str
    headers: str
    params: str
    body_type: str
    body_content: Optional[str]
    auth_type: str
    auth_data: str
    response_status: Optional[int]
    response_time: Optional[float]
    response_size: Optional[int]
    response_headers: str
    response_body: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
