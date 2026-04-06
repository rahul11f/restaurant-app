# 🍽️ Spice & Soul — Full-Stack Restaurant Website

A complete restaurant management system with public website + admin panel.

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free) → https://mongodb.com/atlas
- VS Code

### 1. Clone & Install

```bash
# Install all dependencies at once
cd restaurant-app

cd server && npm install
cd ../client && npm install
cd ../admin && npm install
```

### 2. Configure Environment

```bash
cp server/.env.example server/.env
# Edit server/.env with your credentials
```

### 3. Run (open 3 terminals in VS Code)

```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Public Website
cd client && npm run dev

# Terminal 3 — Admin Panel
cd admin && npm run dev
```

### URLs
- 🌐 Public Website: http://localhost:5173
- 🔧 Admin Panel: http://localhost:5174
- 🖥️ API Server: http://localhost:5000

## Default Admin Login
- Email: admin@spiceandsoul.com
- Password: Admin@123

## Features
See the full blueprint in the app. All features listed there are implemented.
