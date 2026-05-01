# 🍽️ DineQueue

A full-stack restaurant reservation and automated waitlist management system built with **Vue 3** and **Node.js**.

---

## Overview

DineQueue is a web-based platform that solves the real-world problem of table overbooking and inefficient waitlist handling. The system supports two distinct roles — **Customers** and **Restaurant Staff (Hosts)** — each with a dedicated, secured portal.

The standout feature is an **autonomous waitlist promotion engine**: when a confirmed reservation is canceled, the backend automatically finds the longest-waiting customer and promotes them to a confirmed seat — no manual intervention required.

---

## Features

- 🔐 **Dual-Role Authentication** — Secure JWT-based login for Customers and Hosts
- 📊 **Live Capacity Tracking** — Dynamic party-size math prevents overbooking
- 📅 **Reservation Engine** — Dedicated booking flow with party size confirmation
- ⏳ **Intelligent Waitlisting** — Full tables auto-lock and route users to a fair queue
- ⚡ **Auto-Promotion Engine** — Cancellations trigger automatic waitlist upgrades via SQL transactions
- 🛠️ **Host Admin Panel** — Publish slots, view rosters, drop guests, delete blocks
- 👤 **Personalized Dashboards** — Live countdown timers and accurate global queue position

---

## Tech Stack

### Frontend
| Tool | Purpose |
|------|---------|
| Vue 3 (Composition API) | Reactive UI framework |
| Vite | Development server & build tool |
| Vue Router | Client-side navigation |
| Pinia | Global auth state management |
| Axios | HTTP requests to the backend API |

### Backend
| Tool | Purpose |
|------|---------|
| Node.js | Server-side JavaScript runtime |
| Express.js | RESTful API framework |
| SQLite3 | Lightweight relational database |
| JWT | Stateless authentication tokens |
| Bcrypt | Secure password hashing |

---

## Getting Started

### Prerequisites
- Node.js v18+
- npm

### 1. Clone the Repository
```bash
git clone https://github.com/Codeayo/Dinequeue.git
cd Dinequeue
```

### 2. Start the Backend
```bash
cd server
npm install
npm run dev
```
Server runs at `http://localhost:5050`

### 3. Start the Frontend
```bash
cd client
npm install
npm run dev
```
App runs at `http://localhost:5173`

---

## Database Schema

| Table | Description |
|-------|-------------|
| `users` | Stores name, email, hashed password, and role (`HOST` or `USER`) |
| `slots` | Dining time blocks created by a Host with capacity limits |
| `bookings` | Confirmed reservations with status (`CONFIRMED` / `CANCELED`) |
| `waitlist` | Standby queue with status (`WAITING` / `PROMOTED` / `REMOVED`) |

---

## Project Structure

```
Dinequeue/
├── client/                 # Vue 3 Frontend
│   └── src/
│       ├── pages/          # Login, Slots, Book, Bookings, Host Dashboard
│       ├── stores/         # Pinia auth store
│       ├── router/         # Vue Router config
│       ├── api/            # Axios instance
│       └── composables/    # Reusable logic (toast, formatters, etc.)
└── server/                 # Node.js Backend
    ├── routes/             # auth, slots, bookings
    ├── db/                 # SQLite database + init script
    └── utils/              # JWT helpers & middleware
```

---

## Authors

- **Ayomide Onafowokan** — aonafowokan1@student.gsu.edu
- **Joseph Boone** — jboone12@student.gsu.edu

Georgia State University — Department of Computer Science
