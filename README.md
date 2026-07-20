# Travel Booking Application

## ✅ Frontend & Backend Connected

### Current Status
- **Backend Server**: Running on `http://127.0.0.1:8000`
- **Frontend Server**: Running on `http://localhost:5173`
- **Database**: SQLite (or PostgreSQL via `.env`)

### Quick Start

#### 1. Backend (FastAPI)
```bash
cd /Users/linhlinh/travel/backend
source ../.venv/bin/activate
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Backend will start on: **http://127.0.0.1:8000**

#### 2. Frontend (React + Vite)
```bash
cd /Users/linhlinh/travel/frontend
npm run dev
```

Frontend will start on: **http://localhost:5173** (or next available port)

### API Documentation
- Swagger UI: http://127.0.0.1:8000/docs
- ReDoc: http://127.0.0.1:8000/redoc

### Sample Endpoints

#### Get all tours
```bash
curl http://127.0.0.1:8000/api/v1/tours/
```

#### Create a tour
```bash
curl -X POST http://127.0.0.1:8000/api/v1/tours/ \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Tour Hạ Long Bay",
    "description": "Khám phá vịnh Hạ Long",
    "price": 1500000,
    "duration": 2,
    "max_group_size": 20,
    "featured": true
  }'
```

### Project Structure

```
travel/
├── backend/
│   ├── main.py              # FastAPI app entry point
│   ├── app/
│   │   ├── api/v1/          # API routers
│   │   ├── models/          # SQLAlchemy models
│   │   ├── schemas/         # Pydantic schemas
│   │   ├── crud/            # Database operations
│   │   ├── database.py      # DB configuration
│   │   └── core/            # Config files
│   └── requirements.txt      # Python dependencies
│
└── frontend/
    ├── src/
    │   ├── App.jsx          # Main React component
    │   ├── styles.css       # Traveloka-inspired styling
    │   ├── api.js           # API client functions
    │   └── main.jsx         # Entry point
    ├── package.json         # Node dependencies
    └── vite.config.js       # Vite configuration
```

### Frontend Features

- 🎨 Traveloka-inspired UI design
- 📱 Responsive layout (desktop, tablet, mobile)
- 🏨 Hero section with search card
- 🗺️ Featured tours display
- ✏️ Tour creation form
- 🔄 Real-time data sync with backend

### Backend Features

- 🚀 FastAPI for high performance
- 🔐 Async/await support
- 🌐 CORS enabled for frontend
- 💾 SQLAlchemy ORM
- 📸 UUID-based identifiers
- 📚 Auto-generated API docs

