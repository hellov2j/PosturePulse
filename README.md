# PosturePulse

Real-time workout posture correction powered by computer vision. No wearables, no recordings — just your camera and AI.

## Features

- **6 exercises**: Squat, Push-Up, Lunge, Deadlift, Plank, Bicep Curl
- **33 body landmarks** tracked at ~30 FPS via MediaPipe Pose Landmarker
- **Real-time skeleton overlay** with color-coded severity (green / yellow / red)
- **Voice feedback** via Web Speech API with cooldown
- **Form scoring** (0–100%) with rep counting and set management
- **Workout dashboard** with aggregate stats and session history
- **Fully local** — nothing is recorded or uploaded

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.10+, FastAPI, SQLAlchemy, SQLite |
| Frontend | Vanilla JS, Canvas API, WebSocket, MediaPipe (browser) |
| Real-time | WebSocket bidirectional communication |
| Pose detection | MediaPipe Pose Landmarker (GPU with CPU fallback) |

## Getting Started

### Prerequisites

- Python 3.10+
- A modern browser with webcam access

### Installation

```bash
# Clone the repository
git clone https://github.com/<your-username>/gym-posture.git
cd gym-posture

# Install backend dependencies
pip install -r backend/requirements.txt
```

### Running

```bash
python -m backend.main
```

Open [http://localhost:8000](http://localhost:8000) in your browser.

## Project Structure

```
gym-posture/
├── backend/
│   ├── main.py                 # FastAPI app, CORS, static file serving
│   ├── database.py             # SQLAlchemy engine & session factory
│   ├── requirements.txt        # Python dependencies
│   ├── models/
│   │   ├── session.py          # ORM models: WorkoutSession, Rep
│   │   └── schemas.py          # Pydantic request/response schemas
│   ├── routers/
│   │   ├── websocket.py        # /ws endpoint, session lifecycle
│   │   └── sessions.py         # REST API for session CRUD & stats
│   └── services/
│       ├── scorer.py           # SessionManager, exercise registry
│       ├── feedback.py         # Severity classification
│       ├── angle_calculator.py # Joint angle math (numpy)
│       └── exercises/
│           ├── base.py         # Abstract ExerciseValidator
│           ├── squat.py
│           ├── pushup.py
│           ├── lunge.py
│           ├── deadlift.py
│           ├── plank.py
│           └── curl.py
├── frontend/
│   ├── index.html              # Single-page app (4 views)
│   ├── css/
│   │   └── style.css           # Dark athletic HUD theme
│   ├── js/
│   │   ├── app.js              # Main controller, detection loop
│   │   ├── canvas.js           # Skeleton drawing, angle annotations
│   │   ├── config.js           # Exercise configs, constants, mappings
│   │   ├── feedback.js         # HUD updates, TTS, alerts
│   │   ├── pose.js             # MediaPipe Pose Landmarker init
│   │   ├── ui.js               # View switching, dashboard
│   │   └── websocket.js        # WS client with auto-reconnect
│   └── assets/                 # Static assets (images, icons)
└── .gitignore
```

## API

### REST Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/` | Serves the frontend |
| `GET` | `/api/sessions/` | List sessions (pagination: `skip`, `limit`) |
| `POST` | `/api/sessions/` | Create a new session (`?exercise=squat`) |
| `GET` | `/api/sessions/stats/summary` | Aggregate stats |
| `GET` | `/api/sessions/{id}` | Session detail with reps |
| `PUT` | `/api/sessions/{id}/complete` | Complete session (JSON body) |

### WebSocket (`/ws`)

**Client → Server**

| Type | Payload | Description |
|------|---------|-------------|
| `start` | `{exercise}` | Begin a workout session |
| `landmarks` | `{landmarks[], exercise, timestamp}` | Send pose data for analysis |
| `next_set` | — | Advance to next set |
| `end` | — | End session, save to DB |
| `ping` | — | Keepalive |

**Server → Client**

| Type | Payload | Description |
|------|---------|-------------|
| `session_started` | `{exercise, message}` | Confirms session start |
| `feedback` | `{angles, is_correct, corrections, form_score, rep_count, set_count, severity}` | Real-time analysis |
| `correction` | `{message, severity, joint_indices}` | Specific correction |
| `set_started` | `{set_count}` | New set confirmation |
| `session_ended` | `{stats}` | Session summary |
| `error` | `{message}` | Error notification |
| `pong` | — | Keepalive response |

## How It Works

1. **Open your camera** — MediaPipe Pose Landmarker runs entirely in the browser
2. **Choose an exercise** — Each has custom angle rules and target ranges
3. **Get real-time feedback** — Skeleton overlay, voice corrections, form score

## License

MIT
