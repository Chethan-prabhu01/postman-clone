import httpx
import json
import time
import re
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import RunnerRequest, RunnerResponse
from app.models import RequestHistory, Environment

router = APIRouter()


def resolve_variables(text: str, variables: dict) -> str:
    """Replace {{variable}} placeholders with environment variable values."""
    if not text:
        return text
    for key, value in variables.items():
        text = text.replace(f"{{{{{key}}}}}", str(value))
    return text


def get_environment_variables(db: Session, environment_id: int) -> dict:
    """Fetch active environment variables as a dict."""
    if not environment_id:
        return {}
    env = db.query(Environment).filter(Environment.id == environment_id).first()
    if not env:
        return {}
    return {
        var.key: var.value
        for var in env.variables
        if var.enabled and var.value is not None
    }


@router.post("/send", response_model=RunnerResponse)
async def send_request(payload: RunnerRequest, db: Session = Depends(get_db)):
    # Resolve environment variables
    env_vars = get_environment_variables(db, payload.environment_id)

    # Build URL with resolved variables
    url = resolve_variables(payload.url, env_vars)

    # Build query params
    query_params = {}
    for p in (payload.params or []):
        if p.enabled and p.key:
            query_params[p.key] = resolve_variables(p.value, env_vars)

    # Build headers
    headers = {}
    for h in (payload.headers or []):
        if h.enabled and h.key:
            headers[h.key] = resolve_variables(h.value, env_vars)

    # Auth
    if payload.auth_type == "bearer" and payload.auth_data:
        token = payload.auth_data.get("token", "")
        if token:
            headers["Authorization"] = f"Bearer {resolve_variables(token, env_vars)}"
    elif payload.auth_type == "basic" and payload.auth_data:
        username = payload.auth_data.get("username", "")
        password = payload.auth_data.get("password", "")

    # Build body
    body_content = None
    if payload.body_type == "raw" and payload.body_content:
        body_content = resolve_variables(payload.body_content, env_vars)
        if "Content-Type" not in headers:
            headers["Content-Type"] = "application/json"
    elif payload.body_type == "form-data" and payload.body_content:
        body_content = payload.body_content
    elif payload.body_type == "urlencoded" and payload.body_content:
        body_content = payload.body_content

    # Send request
    start = time.time()
    try:
        async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
            # Auth
            auth = None
            if payload.auth_type == "basic" and payload.auth_data:
                auth = (
                    payload.auth_data.get("username", ""),
                    payload.auth_data.get("password", "")
                )

            # Build request kwargs
            req_kwargs = {
                "method": payload.method,
                "url": url,
                "headers": headers,
                "params": query_params if query_params else None,
                "auth": auth,
            }

            if payload.body_type == "raw" and body_content:
                req_kwargs["content"] = body_content.encode()
            elif payload.body_type == "urlencoded" and body_content:
                pairs = {}
                for part in body_content.split("&"):
                    if "=" in part:
                        k, v = part.split("=", 1)
                        pairs[k] = v
                req_kwargs["data"] = pairs
            elif payload.body_type == "form-data" and body_content:
                try:
                    form_list = json.loads(body_content)
                    form_data = {item["key"]: item["value"] for item in form_list if item.get("key")}
                    req_kwargs["data"] = form_data
                except Exception:
                    req_kwargs["content"] = body_content.encode()

            response = await client.request(**req_kwargs)

        elapsed = (time.time() - start) * 1000  # ms
        response_body = response.text
        response_headers = dict(response.headers)
        size_bytes = len(response.content)

        # Save to history
        history = RequestHistory(
            method=payload.method,
            url=payload.url,
            headers=json.dumps([h.dict() for h in (payload.headers or [])]),
            params=json.dumps([p.dict() for p in (payload.params or [])]),
            body_type=payload.body_type or "none",
            body_content=payload.body_content,
            auth_type=payload.auth_type or "none",
            auth_data=json.dumps(payload.auth_data or {}),
            response_status=response.status_code,
            response_time=round(elapsed, 2),
            response_size=size_bytes,
            response_headers=json.dumps(response_headers),
            response_body=response_body[:100000],  # cap at 100KB
            environment_id=payload.environment_id,
        )
        db.add(history)
        db.commit()
        db.refresh(history)

        return RunnerResponse(
            status=response.status_code,
            status_text=response.reason_phrase or "",
            time_ms=round(elapsed, 2),
            size_bytes=size_bytes,
            headers=response_headers,
            body=response_body,
            history_id=history.id,
        )

    except httpx.TimeoutException:
        raise HTTPException(status_code=408, detail="Request timed out after 30 seconds")
    except httpx.ConnectError as e:
        raise HTTPException(status_code=502, detail=f"Connection error: {str(e)}")
    except httpx.InvalidURL:
        raise HTTPException(status_code=400, detail="Invalid URL provided")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Request failed: {str(e)}")
