# 🚀 NextEvent — Full Stack Event Management Platform

NextEvent is a **full-stack event management system** that allows users to discover, create, and register for events with real-time updates and a secure authentication system.

The project is divided into two main parts:

* 🖥️ **Frontend** — Built with React
* ⚙️ **Backend API** — Built with Node.js & Express

---

## 📦 Project Structure

```
NextEvent/
├── front-end/     # React application (UI)
├── back-end/      # REST API (server)
└── README.md      # This file
```

---

## 🧩 Overview

### 🖥️ Frontend

* Built with **React 19 + Redux Toolkit**
* Responsive UI using **React Bootstrap**
* Features:

  * Authentication (login / signup)
  * Explore & search events
  * Event details with map
  * Register / cancel tickets
  * User profile & tickets
  * Admin dashboard

📄 See full details: `front-end/README.md`

---

### ⚙️ Backend API

* Built with **Node.js + Express + MongoDB**
* Secure RESTful API with JWT authentication

Features:

* Access & Refresh token authentication
* Role-based access control (User / Admin)
* Event CRUD with capacity handling
* QR code ticket generation
* Image upload via Cloudinary
* Rate limiting & security middleware

📄 See full details: `back-end/README.md`

---

## 🔗 How They Work Together

* Frontend communicates with Backend via REST API
* API base URL is configured using environment variables:

```env
VITE_API_URL=http://localhost:4000/api
```

* Authentication flow:

  * Access token → stored in localStorage
  * Refresh token → stored in httpOnly cookie
  * Axios interceptors handle auto-refresh

---

## ⚙️ Getting Started

### 1️⃣ Clone the repository

```bash
git clone <repo-url>
cd NextEvent
```

---

### 2️⃣ Setup Backend

```bash
cd back-end
npm install
cp .env.example .env
npm run dev
```

Backend runs on:

```
http://localhost:4000
```

---

### 3️⃣ Setup Frontend

```bash
cd ../front-end
npm install
cp .env.example .env
npm run dev
```

Frontend runs on:

```
http://localhost:5173
```

---

## 🔐 Environment Variables

### Backend `.env`

* MongoDB connection
* JWT secrets
* Cloudinary credentials

### Frontend `.env`

```env
VITE_API_URL=http://localhost:4000/api
```

---

## ✨ Key Features

* 🔐 Secure authentication (JWT + refresh tokens)
* 📅 Event creation & management
* 🎟️ Ticket registration with QR codes
* 🗺️ Interactive maps (event location)
* 🔍 Search, filtering, pagination
* 👤 User profiles & tickets
* 🛡️ Admin dashboard
* ⚡ Real-time capacity tracking

---

## 🛠️ Tech Stack

### Frontend

* React, Redux Toolkit, React Router
* Bootstrap, Axios, Leaflet

### Backend

* Node.js, Express
* MongoDB, Mongoose
* JWT, bcrypt
* Cloudinary, Multer

---

## 📌 Notes

* Make sure backend is running before frontend
* Cookies require `withCredentials: true`

---
