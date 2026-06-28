from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Collection(Base):
    __tablename__ = "collections"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    color = Column(String(20), default="#FF6C37")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    folders = relationship("Folder", back_populates="collection", cascade="all, delete-orphan")
    requests = relationship("SavedRequest", back_populates="collection", cascade="all, delete-orphan")


class Folder(Base):
    __tablename__ = "folders"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    collection_id = Column(Integer, ForeignKey("collections.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    collection = relationship("Collection", back_populates="folders")
    requests = relationship("SavedRequest", back_populates="folder", cascade="all, delete-orphan")


class SavedRequest(Base):
    __tablename__ = "saved_requests"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    method = Column(String(20), default="GET")
    url = Column(Text, nullable=False)
    headers = Column(Text, default="[]")       # JSON string
    params = Column(Text, default="[]")        # JSON string
    body_type = Column(String(50), default="none")  # none, raw, form-data, urlencoded
    body_content = Column(Text, nullable=True)
    auth_type = Column(String(50), default="none")  # none, bearer, basic
    auth_data = Column(Text, default="{}")     # JSON string
    collection_id = Column(Integer, ForeignKey("collections.id"), nullable=True)
    folder_id = Column(Integer, ForeignKey("folders.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    collection = relationship("Collection", back_populates="requests")
    folder = relationship("Folder", back_populates="requests")


class Environment(Base):
    __tablename__ = "environments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    variables = relationship("EnvironmentVariable", back_populates="environment", cascade="all, delete-orphan")


class EnvironmentVariable(Base):
    __tablename__ = "environment_variables"

    id = Column(Integer, primary_key=True, index=True)
    environment_id = Column(Integer, ForeignKey("environments.id"), nullable=False)
    key = Column(String(255), nullable=False)
    value = Column(Text, nullable=True)
    is_secret = Column(Boolean, default=False)
    enabled = Column(Boolean, default=True)

    environment = relationship("Environment", back_populates="variables")


class RequestHistory(Base):
    __tablename__ = "request_history"

    id = Column(Integer, primary_key=True, index=True)
    method = Column(String(20), nullable=False)
    url = Column(Text, nullable=False)
    headers = Column(Text, default="[]")
    params = Column(Text, default="[]")
    body_type = Column(String(50), default="none")
    body_content = Column(Text, nullable=True)
    auth_type = Column(String(50), default="none")
    auth_data = Column(Text, default="{}")
    response_status = Column(Integer, nullable=True)
    response_time = Column(Float, nullable=True)   # milliseconds
    response_size = Column(Integer, nullable=True)  # bytes
    response_headers = Column(Text, default="{}")
    response_body = Column(Text, nullable=True)
    environment_id = Column(Integer, ForeignKey("environments.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
