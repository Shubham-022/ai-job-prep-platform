# AI Job Prep Platform

A full-stack web application to help developers prepare for technical interviews — featuring authentication, protected routes, and a modern React + Node.js architecture.

---

## Tech Stack

### Frontend
- **React 19** + **Vite**
- **React Router v7** — client-side routing & protected routes
- **Axios** — HTTP client with cookie-based auth
- **SCSS** — custom styling with glassmorphism design

### Backend
- **Node.js** + **Express 5**
- **MongoDB** + **Mongoose** — database & ODM
- **JWT** — stateless authentication via HTTP-only cookies
- **bcryptjs** — password hashing
- **cors** + **cookie-parser** — cross-origin support

---

## Project Structure

```
project/
├── backend/                  # Express REST API
│   ├── src/
│   │   ├── config/           # Database connection
│   │   ├── controllers/      # Route handlers
│   │   ├── middlewares/      # Auth middleware
│   │   ├── models/           # Mongoose models
│   │   └── routes/           # API routes
│   ├── .env.example          # Environment variable template
│   └── server.js
│
└── frontend/                 # React + Vite SPA
    └── src/
        ├── features/auth/
        │   ├── component/    # Protected route wrapper
        │   ├── hooks/        # useAuth hook
        │   ├── pages/        # Login & Register pages
        │   └── services/     # Axios API calls
        ├── App.jsx
        └── main.jsx
```

---

## Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (or local MongoDB)

### 1. Clone the repository
```bash
git clone https://github.com/Shubham-022/ai-job-prep-platform.git
cd ai-job-prep-platform
```

### 2. Set up the Backend
```bash
cd backend
cp .env.example .env       # Fill in your values
npm install
npm run dev                # Starts on http://localhost:5000
```

### 3. Set up the Frontend
```bash
cd frontend
npm install
npm run dev                # Starts on http://localhost:5173
```

---

## Environment Variables

Create a `backend/.env` file based on `backend/.env.example`:

| Variable | Description |
|---|---|
| `PORT` | Port for the Express server (default: `5000`) |
| `MONGO_URI` | Your MongoDB connection string |
| `JWT_SECRET` | A long, random secret string for signing JWTs |

---

## API Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | Register a new user | ❌ |
| `POST` | `/api/v1/auth/login` | Login & set cookie | ❌ |
| `GET` | `/api/v1/auth/logout` | Clear auth cookie | ✅ |
| `GET` | `/api/v1/auth/get-me` | Get current user | ✅ |

---

## Features

- 🔐 JWT authentication with HTTP-only cookies
- 🛡️ Protected routes with automatic redirect
- 🎨 Modern glassmorphism UI with dark theme
- 🔄 Session restore on page refresh
- 📱 Responsive design

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m "feat: add your feature"`
4. Push: `git push origin feature/your-feature`
5. Open a Pull Request
