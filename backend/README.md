# QuickFix — Full Stack Setup Guide
**React + FastAPI + MySQL**

---

## Architecture Overview

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite + React Router + Zustand |
| Backend | Python 3.11+ + FastAPI + SQLAlchemy |
| Database | MySQL 8.0+ |
| Realtime | FastAPI WebSockets |
| Auth | JWT (python-jose) + Email/Phone OTP |
| File Uploads | Local filesystem (`backend/uploads/`) |

---

## Prerequisites

- **Python 3.11+** — https://python.org
- **Node.js 18+** — https://nodejs.org
- **MySQL 8.0+** — https://mysql.com (XAMPP / MySQL Workbench / plain MySQL)
- **pip** (Python package manager)

---

## Step 1 — MySQL Database Setup

Open MySQL shell or Workbench and run:

```sql
CREATE DATABASE quickfix CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'quickfix_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON quickfix.* TO 'quickfix_user'@'localhost';
FLUSH PRIVILEGES;
```

> **Note**: Tables are created automatically when FastAPI starts up. No SQL scripts needed.

---

## Step 2 — Backend Setup

```bash
# Navigate to the backend directory
cd backend

# Create a Python virtual environment
python -m venv venv

# Activate the environment (Windows)
venv\Scripts\activate

# Activate the environment (macOS/Linux)
source venv/bin/activate

# Install all dependencies
pip install -r requirements.txt
```

### Configure Backend Environment

Edit `backend/.env` with your real values:

```env
DATABASE_URL=mysql+pymysql://root:your_password@localhost:3306/quickfix

JWT_SECRET=your_super_secure_random_secret_key

# SMTP Email (leave empty to print OTP to terminal for testing)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM=noreply@quickfix.com

UPLOAD_DIR=uploads
```

> **Gmail Setup**: For Gmail SMTP, enable 2-Step Verification and create an App Password at https://myaccount.google.com/apppasswords

### Start the Backend Server

```bash
# From inside backend/ directory, with venv activated
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

FastAPI will:
- Create all MySQL tables automatically on first startup
- Serve the API at: `http://localhost:8000`
- Serve API docs at: `http://localhost:8000/docs`
- Serve static uploads at: `http://localhost:8000/uploads/`

---

## Step 3 — Frontend Setup

```bash
# Navigate to the project root (QuickFix/)
cd ..

# Install Node dependencies
npm install

# Start the React dev server
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## Step 4 — Test the Flow

1. Open `http://localhost:5173`
2. Select role (Customer / Provider)
3. Enter mobile number → click Send OTP
4. **OTP appears in your backend terminal window** (unless SMTP configured)
5. Enter the code → profile setup → dashboard

---

## API Endpoints Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/send-otp` | Send OTP to phone/email |
| POST | `/api/v1/auth/verify-otp` | Verify OTP & get JWT token |
| GET | `/api/v1/auth/profile` | Get current user profile |

### Customer
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/customer/profile` | Get customer profile |
| POST | `/api/v1/customer/profile` | Create/update customer profile |

### Provider
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/provider/list` | Get nearby approved providers |
| GET | `/api/v1/provider/profile` | Get own provider profile |
| GET | `/api/v1/provider/profile/{id}` | Get provider by ID |
| POST | `/api/v1/provider/profile` | Create/update provider profile |
| POST | `/api/v1/provider/upload` | Upload profile photo or file |

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/booking/create` | Create new booking |
| GET | `/api/v1/booking/list` | Get all user bookings |
| GET | `/api/v1/booking/detail/{id}` | Get booking details |
| PUT | `/api/v1/booking/status/{id}` | Update booking status |

### Reviews
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/reviews/submit` | Submit review |
| GET | `/api/v1/reviews/provider/{id}` | Get provider reviews |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/notifications/list` | Get user notifications |
| PUT | `/api/v1/notifications/read` | Mark all as read |

### Chats
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/chats/history/{booking_id}` | Get message history |
| POST | `/api/v1/chats/send/{booking_id}` | Send a chat message |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/admin/providers` | List all providers |
| PUT | `/api/v1/admin/approve/{id}?approved=true` | Approve/reject provider |

### WebSocket
| Protocol | Endpoint | Description |
|----------|----------|-------------|
| WS | `/ws/{user_id}` | Real-time updates per user |

---

## Database Schema Summary

```
users            — id, email, phone, role, setup_complete
customers        — user_id (FK), full_name, avatar_url, gps_lat, gps_lng, address, city, state
providers        — user_id (FK), full_name, profession, subcategory, experience_years,
                   per_visit_charge, service_charge, lat, lng, is_available, approval_status,
                   avg_rating, total_reviews
provider_services — id, provider_id (FK), service_name, price, description
provider_images  — id, provider_id (FK), image_url
provider_documents — id, provider_id (FK), document_type, document_url
bookings         — id, customer_id (FK), provider_id (FK), service_name, scheduled_at,
                   address, notes, amount, status, completed_at
reviews          — id, booking_id (FK), customer_id (FK), provider_id (FK), rating, comment
notifications    — id, user_id (FK), type, title, body, booking_id, is_read
chats            — id, booking_id (FK), sender_id, sender_role, message
payments         — id, booking_id (FK), amount, payment_method, status
```

---

## Folder Structure

```
QuickFix/
├── src/                     # React Frontend (unchanged UI)
│   ├── lib/
│   │   ├── api.js           # NEW: FastAPI HTTP client wrapper
│   │   ├── db.js            # MODIFIED: All ops now use api.js
│   │   └── supabase.js      # STUBBED: No-op stubs to prevent crashes
│   ├── store/
│   │   └── authStore.js     # MODIFIED: Uses JWT token from backend
│   └── hooks/
│       ├── useRealtimeBooking.js      # MODIFIED: Uses WebSocket
│       └── useRealtimeNotifications.js # MODIFIED: Uses WebSocket
│
└── backend/                 # NEW: FastAPI Backend
    ├── .env                 # Environment variables
    ├── requirements.txt     # Python dependencies
    └── app/
        ├── main.py          # App entry + CORS + WebSocket endpoint
        ├── config.py        # Environment config loader
        ├── database.py      # SQLAlchemy engine and session
        ├── models/
        │   └── models.py    # All SQLAlchemy table models
        ├── schemas/
        │   └── schemas.py   # Pydantic request/response schemas
        ├── services/
        │   ├── auth.py      # JWT generation and validation
        │   └── otp.py       # OTP generation and SMTP dispatch
        ├── core/
        │   └── sockets.py   # WebSocket ConnectionManager
        └── routers/
            ├── auth.py        # /api/v1/auth/*
            ├── customer.py    # /api/v1/customer/*
            ├── provider.py    # /api/v1/provider/*
            ├── booking.py     # /api/v1/booking/*
            ├── reviews.py     # /api/v1/reviews/*
            ├── notifications.py # /api/v1/notifications/*
            ├── chats.py       # /api/v1/chats/*
            └── admin.py       # /api/v1/admin/*
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `Access denied for user` | Check MySQL credentials in `.env` |
| `Connection refused` | Make sure MySQL server is running |
| `CORS error` | Ensure backend is on port 8000 |
| `OTP not received` | Check terminal output — OTP is printed there without SMTP config |
| `WebSocket failed` | Ensure FastAPI is running before starting React |
| `401 Unauthorized` | JWT token expired — log out and log in again |
