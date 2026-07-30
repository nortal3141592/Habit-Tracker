# Habit Tracker

A minimalistic, spreadsheet-style habit tracker. Rows are days, columns are habits, checkboxes are your daily record. Nothing more.

This is a **local, single-user tool**, so, no accounts, no cloud sync, no email verification, no password reset. It's meant to run on your own machine, tracked by you, for you.

The entire design philosophy is simple: **keep the surface area small, keep the data honest, and keep the friction low enough that you'll actually open it every day.**

One rule the app enforces on purpose: **days can never be deleted, only appended.** Habits can be added or archived, but your historical record of a day is permanent once it exists. This is intentional, since the tracker is meant to hold you accountable to what actually happened, not let you retroactively tidy up your history.

> **Disclaimer:** The backend (FastAPI, SQLAlchemy, SQLite) was designed and written by hand, endpoint by endpoint, with deliberate architectural decisions at every step. The frontend (React, TypeScript, Vite) was vibe-coded in a separate session with much lighter oversight. If something feels solid and considered, it's probably backend. If something feels a little loose, it's probably frontend.

---

## Tech stack

### Backend

* FastAPI + SQLAlchemy 2.0 (async) + SQLite
* Pydantic v2 for request/response validation
* [uv](https://docs.astral.sh/uv/) for Python dependency management

### Frontend

* Vite + React + TypeScript
* React Router
* TanStack React Query
* Tailwind CSS v4

---

# Initial setup

You only need to do this once.

## 1. Install uv

Skip this if `uv` is already installed.

**macOS — Homebrew**

```bash
brew install uv
```

**macOS / Linux**

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

**Windows — PowerShell**

```powershell
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

Verify:

```bash
uv --version
```

---

## 2. Set up the backend

From the repository root:

```bash
uv sync
```

This automatically:

* creates the virtual environment
* installs the project's Python version from `.python-version`
* installs the locked dependencies from `uv.lock`

You **do not** need to manually create or activate `.venv`.

> **Database:** This project does not use Alembic. `dev.db` is created from the SQLAlchemy models when the application initializes the database.

---

## 3. Set up the frontend

```bash
cd habit-tracker-frontend
npm install
```

This installs the dependencies recorded in `package-lock.json`.

---

## 4. Check the ports

The frontend and backend currently expect:

| Service  | URL                     |
| -------- | ----------------------- |
| Backend  | `http://localhost:8000` |
| Frontend | `http://localhost:5173` |

The frontend API client points to:

```text
http://localhost:8000/api
```

The backend CORS configuration allows:

```text
http://localhost:5173
```

---

# How to use

Once setup is complete, you only need **two terminals**.

## 1. Start the backend

From the repository root:

```bash
cd app
uv run uvicorn app.main:app --reload
```

Backend:

```text
http://localhost:8000
```

> `app/main.py` is the intended FastAPI entry point

---

## 2. Start the frontend

Open a second terminal:

```bash
cd habit-tracker-frontend
npm run dev
```

Frontend:

```text
http://localhost:5173
```

Open that URL in your browser.

---

## 3. Start tracking

### Home

* View all your trackers.
* Create a tracker by choosing its name, schedule, and initial habits.

### Tracker

* Check habits directly in the spreadsheet grid.
* Click **Save Changes** to persist your updates.
* Use **+** to add habits.
* Archive habits you no longer track.
* Append more days when your current schedule ends.

### Deleting

* Delete a tracker from either **Home** or **Tracker**.
* Deleting a tracker permanently removes everything inside it.
* Individual days **cannot** be deleted.

---

## Daily workflow

```text
Start backend
      ↓
Start frontend
      ↓
Open localhost:5173
      ↓
Check today's habits
      ↓
Save Changes
```

That's it.

There is no background service, cloud sync, or offline mode. When both processes are stopped, the app is stopped.

> **Database note:** If the application does not automatically create `dev.db` on first launch, check `app/main.py` for the database initialization code.

---

### Backend

```text
app/
├── core/        # configuration, database, exception handling
├── routers/     # API route handlers
├── utils/       # business logic
├── main.py      # FastAPI application entry point
├── models.py    # SQLAlchemy models
└── schemas.py   # Pydantic schemas
```

### Frontend

```text
habit-tracker-frontend/
└── src/
    ├── api/         # API client
    ├── assets/      # static assets
    ├── components/  # reusable UI components
    ├── pages/       # application pages
    ├── App.tsx
    ├── App.css
    ├── index.css
    └── main.tsx
```

---

# Notes and known limitations

* **No authentication** — anyone with access to the machine can use the app.
* **No automated tests** — important logic was manually verified during development.
* **SQLite only** — intentionally chosen for this local, single-user use case.
* **No migrations** — deleting `dev.db` is currently the way to apply schema changes.
* **Do not expose the backend beyond `localhost`** without adding authentication or another access-control layer.

Because this application is local and single-user by design, these limitations are intentional rather than unfinished production features.
