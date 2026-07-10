# 🍎 Apple App Store Clone

A pixel-perfect, production-ready Apple App Store clone with realtime features.

## 🚀 Quick Start

### 1. Start the Backend
```bash
cd backend
npm install
node server.js
# ✅ Running on http://localhost:3001
```

### 2. Start the Frontend
```bash
cd frontend
npm install
npm run dev
# ✅ Running on http://localhost:5173
```

## 🔐 Admin Access
- URL: http://localhost:5173/admin/login
- Email: `admin@appstore.com`
- Password: `admin123`

## 📱 Pages
| Route | Description |
|-------|-------------|
| `/` | Home — Featured banner, top free/paid, categories |
| `/app/:id` | App detail with screenshots, reviews, realtime counters |
| `/search` | Live search with debounce + trending apps |
| `/top-charts` | Free / Paid / Grossing charts |
| `/category/:slug` | Category page (games, social, health, etc.) |
| `/admin` | Admin dashboard with analytics |
| `/admin/login` | Admin login |

## 🛠 Tech Stack

**Frontend:** React 18, Vite, Tailwind CSS, Framer Motion, React Query, Zustand, Swiper, Socket.io Client

**Backend:** Node.js, Express, Socket.io, Multer (file uploads), JWT Auth

**Demo Mode:** In-memory data store with 20 pre-seeded apps (no Firebase/Supabase required)

## ⚡ Realtime Features (Socket.io)
- Live install count updates on app detail page
- Live viewer count ("X people viewing this app")
- New reviews pushed to all viewers instantly

## 🔧 Environment Variables

### Backend (`backend/.env`)
```
PORT=3001
NODE_ENV=development
JWT_SECRET=your_secret_key
```

### For Firebase + Supabase (optional — app works without these)
```
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY=...
SUPABASE_URL=...
SUPABASE_SERVICE_KEY=...
```

### Frontend (`frontend/.env`)
```
VITE_API_URL=http://localhost:3001
VITE_SOCKET_URL=http://localhost:3001
```

## 📦 Project Structure
```
app store/
├── backend/
│   ├── src/
│   │   ├── routes/         # apps, auth, categories, search, upload
│   │   ├── services/       # dataStore (in-memory), socket, firebase
│   │   └── middleware/     # error handler
│   └── server.js
└── frontend/
    └── src/
        ├── components/     # AppCard, FeaturedBanner, InstallButton, AppIcon
        ├── pages/          # Home, AppDetail, Search, TopCharts, Category, Admin
        ├── services/       # api.js, socket.js
        ├── store/          # Zustand (install state, auth, UI)
        └── utils/          # formatters
```

## 🎨 Design System
- **Background:** Pure black (`#000000`)
- **Surface:** `#1C1C1E` / `#2C2C2E`
- **Accent:** Apple Blue `#0A84FF`
- **Green:** `#30D158` (installs/open)
- **Font:** SF Pro Display / system font stack
- **Animations:** Framer Motion throughout
- **Glassmorphism:** Navbar with `backdrop-filter: blur(20px)`
