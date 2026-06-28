# 🚀 Postman Clone — Full-Stack API Client

A pixel-faithful clone of Postman built with **Next.js 14 (TypeScript)** + **FastAPI (Python)** + **SQLite**.

---

## 📁 Project Structure (VS Code)

```
postman-clone/                          ← Open THIS folder in VS Code
│
├── backend/                            ← Python FastAPI backend
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                     ← FastAPI app entry, CORS, startup
│   │   ├── database.py                 ← SQLAlchemy + SQLite connection
│   │   ├── models.py                   ← All DB table definitions (ORM)
│   │   ├── schemas.py                  ← Pydantic request/response schemas
│   │   ├── seed.py                     ← Sample data seeder (runs on startup)
│   │   └── routers/
│   │       ├── __init__.py
│   │       ├── collections.py          ← CRUD: collections + folders
│   │       ├── requests.py             ← CRUD: saved requests
│   │       ├── environments.py         ← CRUD: environments + variables
│   │       ├── history.py              ← Request history endpoints
│   │       └── runner.py               ← Proxy: sends real HTTP requests
│   ├── requirements.txt
│   ├── run.py                          ← python run.py to start server
│   ├── .env
│   └── postman_clone.db                ← SQLite DB (auto-created on first run)
│
└── frontend/                           ← Next.js 14 TypeScript frontend
    ├── src/
    │   ├── app/
    │   │   ├── layout.tsx              ← Root layout (fonts, toaster)
    │   │   ├── page.tsx                ← Entry → renders <Workspace />
    │   │   └── globals.css             ← Tailwind base + custom classes
    │   ├── components/
    │   │   ├── layout/
    │   │   │   ├── TopBar.tsx          ← Top nav: logo, env selector, settings
    │   │   │   └── Workspace.tsx       ← Main 3-panel resizable layout
    │   │   ├── sidebar/
    │   │   │   ├── Sidebar.tsx         ← Sidebar shell with tab switcher
    │   │   │   ├── CollectionsPanel.tsx← Tree view: collections/folders/requests
    │   │   │   ├── HistoryPanel.tsx    ← Grouped request history list
    │   │   │   └── EnvironmentsPanel.tsx← Env CRUD with variable editor
    │   │   ├── request/
    │   │   │   ├── RequestTabs.tsx     ← Multi-tab bar (open requests)
    │   │   │   ├── RequestBuilder.tsx  ← URL bar + Send + section tabs
    │   │   │   ├── KeyValueEditor.tsx  ← Reusable Params/Headers table
    │   │   │   ├── BodyEditor.tsx      ← none/raw/form-data/urlencoded body
    │   │   │   ├── AuthEditor.tsx      ← none/bearer/basic auth forms
    │   │   │   └── CodeMirrorEditor.tsx← Syntax-highlighted JSON editor
    │   │   ├── response/
    │   │   │   └── ResponseViewer.tsx  ← Status, time, size, body, headers
    │   │   └── modals/
    │   │       └── SaveRequestModal.tsx← Save to collection modal
    │   ├── lib/
    │   │   ├── api.ts                  ← Axios client + all API calls
    │   │   └── store.ts                ← Zustand global state (tabs, envs…)
    │   └── types/
    │       └── index.ts                ← All TypeScript interfaces
    ├── package.json
    ├── tailwind.config.js
    ├── tsconfig.json
    ├── next.config.js
    ├── postcss.config.js
    ├── .env.local
    └── .eslintrc.json
```

---

## 🗄️ Database Schema (SQLite)

```
┌─────────────────────────────────────────────────────────────┐
│                       collections                            │
│  id PK | name | description | color | created_at | updated_at│
└──────────────────────────┬──────────────────────────────────┘
                           │ 1:N
          ┌────────────────┼────────────────────────┐
          ▼                                         ▼
┌──────────────────┐                   ┌─────────────────────────────────────────┐
│    folders       │                   │            saved_requests                │
│ id PK            │◄──────────────────│ id PK                                   │
│ name             │  folder_id FK     │ name, method, url                       │
│ collection_id FK │                   │ headers (JSON), params (JSON)            │
└──────────────────┘                   │ body_type, body_content                  │
                                       │ auth_type, auth_data (JSON)              │
                                       │ collection_id FK, folder_id FK (null OK) │
                                       │ created_at, updated_at                   │
                                       └─────────────────────────────────────────┘

┌──────────────────────────────────────┐
│           environments               │
│  id PK | name | is_active            │
└──────────────┬───────────────────────┘
               │ 1:N
               ▼
┌──────────────────────────────────────┐
│       environment_variables          │
│  id PK | environment_id FK           │
│  key | value | is_secret | enabled   │
└──────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     request_history                          │
│  id PK | method | url | headers | params                     │
│  body_type | body_content | auth_type | auth_data            │
│  response_status | response_time | response_size             │
│  response_headers | response_body | environment_id FK        │
│  created_at                                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚡ Quick Start (Step-by-Step)

### Prerequisites — Install These First

| Tool | Version | Download |
|------|---------|----------|
| Python | 3.10+ | https://python.org/downloads |
| Node.js | 18+ | https://nodejs.org |
| VS Code | Latest | https://code.visualstudio.com |

---

### Step 1 — Clone / Download the Project

```bash
# If you have the zip, extract it. Then open VS Code:
code postman-clone
```

Or if using git:
```bash
git clone <your-repo-url> postman-clone
cd postman-clone
code .
```

---

### Step 2 — Set Up the Backend (Python + FastAPI + SQLite)

Open VS Code's integrated terminal: **Terminal → New Terminal** (`Ctrl+` `` ` ``)

```bash
# Navigate to backend folder
cd backend

# Create a Python virtual environment
python -m venv venv

# Activate it:
# Windows (Command Prompt):
venv\Scripts\activate
# Windows (PowerShell):
venv\Scripts\Activate.ps1
# macOS / Linux:
source venv/bin/activate

# You should see (venv) in your terminal prompt now

# Install all Python packages
pip install -r requirements.txt
```

**What gets installed:**
```
fastapi==0.111.0       ← Web framework
uvicorn[standard]      ← ASGI server (runs FastAPI)
sqlalchemy==2.0.30     ← ORM (talks to SQLite)
httpx==0.27.0          ← Async HTTP client (proxy runner)
pydantic==2.7.1        ← Data validation
python-multipart       ← Form data support
```

**SQLite is built into Python — no separate installation needed!**
The `.db` file is created automatically on first run.

```bash
# Start the backend server
python run.py
```

You should see:
```
✅ Database seeded successfully
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

✅ Backend is running at **http://localhost:8000**
✅ API docs at **http://localhost:8000/docs**

---

### Step 3 — Set Up the Frontend (Next.js + TypeScript)

Open a **second terminal** in VS Code (`Ctrl+Shift+5` or click `+` in terminal panel):

```bash
# Navigate to frontend folder
cd frontend

# Install all Node.js packages (this takes ~2 minutes)
npm install
```

**What gets installed:**
```
next 14            ← React framework (SSR + routing)
react / react-dom  ← UI library
zustand            ← Global state management
axios              ← HTTP client (calls backend API)
react-hot-toast    ← Toast notifications
react-resizable-panels ← Draggable split panels
@uiw/react-codemirror  ← Code editor with syntax highlighting
@codemirror/lang-json  ← JSON language support
lucide-react       ← Icon library
tailwindcss        ← Utility CSS framework
typescript         ← Type safety
```

```bash
# Start the frontend dev server
npm run dev
```

You should see:
```
▲ Next.js 14.2.3
  - Local:        http://localhost:3000
  - Ready in 2.1s
```

✅ Frontend is running at **http://localhost:3000**

---

### Step 4 — Open the App

Go to **http://localhost:3000** in your browser.

You'll see the Postman-like workspace with:
- 📁 **JSONPlaceholder API** collection (pre-seeded)
- 🧪 **HTTPBin Tests** collection (pre-seeded)
- 🌍 **Development** + **Production** environments
- 📜 3 sample history entries

---

## 🔧 VS Code Setup (Recommended Extensions)

Install these from the Extensions panel (`Ctrl+Shift+X`):

```
ms-python.python           ← Python language support
ms-python.pylance           ← Python IntelliSense
bradlc.vscode-tailwindcss   ← Tailwind CSS autocomplete
dbaeumer.vscode-eslint      ← ESLint linting
esbenp.prettier-vscode      ← Code formatter
mtxr.sqltools               ← View SQLite DB visually
alexcvzz.vscode-sqlite      ← Browse the .db file in VS Code
```

**To view the SQLite database in VS Code:**
1. Install `alexcvzz.vscode-sqlite` extension
2. Right-click `backend/postman_clone.db`
3. Select "Open Database"
4. Browse tables in the "SQLite Explorer" sidebar

---

## 🗂️ API Endpoints Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/collections/` | List all collections |
| POST | `/api/collections/` | Create collection |
| PATCH | `/api/collections/{id}` | Update collection |
| DELETE | `/api/collections/{id}` | Delete collection |
| GET | `/api/collections/{id}/tree` | Full tree with folders+requests |
| POST | `/api/collections/{id}/folders` | Create folder |
| POST | `/api/requests/` | Save a request |
| PATCH | `/api/requests/{id}` | Update saved request |
| DELETE | `/api/requests/{id}` | Delete saved request |
| GET | `/api/environments/` | List environments |
| POST | `/api/environments/` | Create environment |
| PATCH | `/api/environments/{id}` | Update + set variables |
| POST | `/api/environments/{id}/activate` | Set active environment |
| GET | `/api/history/` | Get request history |
| DELETE | `/api/history/` | Clear all history |
| POST | `/api/runner/send` | **Send real HTTP request (proxy)** |

---

## ✨ Features Implemented

- ✅ Multi-tab request workspace
- ✅ Method selector (GET/POST/PUT/PATCH/DELETE/HEAD/OPTIONS)
- ✅ URL bar with query param sync
- ✅ Key-value editors for Params + Headers
- ✅ Body: none / raw JSON / form-data / x-www-form-urlencoded
- ✅ Auth: None / Bearer Token / Basic Auth
- ✅ Real HTTP request proxy (no CORS issues)
- ✅ Response: pretty/raw JSON, status, time, size, headers
- ✅ Collections with folders (full CRUD)
- ✅ Save/update requests to collections
- ✅ Environment variables (`{{variable}}` syntax)
- ✅ Variable resolution at send-time
- ✅ Request history (auto-recorded, grouped by date)
- ✅ Resizable panels (sidebar ↔ main, request ↔ response)
- ✅ Toast notifications
- ✅ Dark Postman-like theme

---

## 🛠️ Troubleshooting

**Backend won't start:**
```bash
# Make sure venv is activated (you see "(venv)" in terminal)
# If "command not found", use python3:
python3 -m venv venv
python3 run.py
```

**Frontend: "Module not found":**
```bash
cd frontend
rm -rf node_modules .next
npm install
npm run dev
```

**CORS errors in browser:**
Make sure backend is on port 8000 and frontend on port 3000.
Check `backend/.env` has `ALLOWED_ORIGINS=http://localhost:3000`.

**Port already in use:**
```bash
# Kill process on port 8000 (backend):
# Windows: netstat -ano | findstr :8000 → taskkill /PID <pid> /F
# Mac/Linux: lsof -ti:8000 | xargs kill

# Kill process on port 3000 (frontend):
# Windows: netstat -ano | findstr :3000 → taskkill /PID <pid> /F
# Mac/Linux: lsof -ti:3000 | xargs kill
```

**Reset the database:**
```bash
cd backend
rm postman_clone.db
python run.py   # re-creates and re-seeds automatically
```
