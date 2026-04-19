# NextEvent API

NextEvent is a modern, secure RESTful API for event management, allowing users to create, discover, and register for events with real-time capacity tracking and QR-based tickets.

— built with **Node.js**, **Express**, and **MongoDB**. Features JWT-based authentication with access tokens and rotating refresh tokens stored in httpOnly cookies, role-based access control (user / admin), QR code ticket generation, event image uploads via Cloudinary, and full input validation.

---

## Key Features

- JWT authentication with rotating refresh tokens
- Role-based access control (admin / user)
- Event capacity management with real-time updates
- QR code ticket generation
- Cloud image storage integration (Cloudinary)
- Pagination, filtering, and search
- Secure API with rate limiting and sanitization

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js (ESM) |
| Framework | Express 4 |
| Database | MongoDB + Mongoose |
| Auth | JWT (access token + refresh token) |
| Validation | express-validator |
| File Upload | multer, cloudinary, multer-storage-cloudinary |
| Security | Helmet, express-rate-limit, express-mongo-sanitize, bcryptjs |
| Other | QRCode, cookie-parser, compression |

---

## Requirements

- Node.js (latest LTS recommended)
- MongoDB (local or Atlas)
- Cloudinary Account (for image uploads)

---

## Setup

**1. Install dependencies**
```bash
npm install
```

**2. Create your environment file**
```bash
# Linux / macOS
cp .env.example .env

# Windows
copy .env.example .env
```

**3. Fill in your `.env` values** (see Environment Variables below)

**4. Start the server**
```bash
npm run dev
```

---

## Environment Variables

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string_here
JWT_ACCESS_SECRET=your_access_token_secret
JWT_REFRESH_SECRET=your_refresh_token_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

| Variable | Description | Example |
|---|---|---|
| `PORT` | Port the server listens on | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/nextevent` |
| `JWT_ACCESS_SECRET` | Secret for signing access tokens | long random string |
| `JWT_REFRESH_SECRET` | Secret for signing refresh tokens | different long random string |
| `JWT_ACCESS_EXPIRES_IN` | Access token lifetime | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token lifetime | `7d` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `dyxxxxx` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `123456789` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `abc123xyz...` |

> ⚠️ Never commit your `.env` file. It is already listed in `.gitignore`.

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start with auto-reload (nodemon) |
| `npm start` | Start production server |

---

## Response Format

All responses follow a consistent JSON structure.

**Success:**
```json
{
  "status": "Success",
  "message": "...",
  "data": { }
}
```

**Error:**
```json
{
  "status": "error",
  "message": "Something went wrong",
  "errors": []
}
```

---

## Authentication

This API uses a **dual-token strategy**:

- **Access token** — short-lived JWT (default: 15 min), sent in the `Authorization: Bearer <token>` header.
- **Refresh token** — long-lived JWT (default: 7 days), stored as an `httpOnly` cookie named `refreshToken`. It is hashed in the database before storage.

To authenticate protected routes, include the access token in the request header:
```
Authorization: Bearer <your_access_token>
```

---

## API Reference

Base URL: `/api`

---

### Auth — `/api/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/signup` | ❌ | Register a new user |
| POST | `/auth/login` | ❌ | Login — returns access token + sets refresh cookie |
| GET | `/auth/refresh` | ❌ (cookie) | Get a new access token using the refresh cookie |
| DELETE | `/auth/logout` | ❌ (cookie) | Logout — deletes refresh token and clears cookie |

**Signup body:**
```json
{
  "name": "Ahmed",
  "email": "ahmed@example.com",
  "password": "Secure123!"
}
```

**Login body:**
```json
{
  "email": "ahmed@example.com",
  "password": "Secure123!"
}
```

---

### Users — `/api/users`

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| GET | `/users/profile` | ✅ | Any | Get own profile with organized & registered events |
| PUT | `/users/update-profile` | ✅ | Any | Update name or email |
| PUT | `/users/change-password` | ✅ | Any | Change password — invalidates all sessions |
| DELETE | `/users/delete-account` | ✅ | Any | Delete own account and all related data |
| GET | `/users/:id` | ❌ | — | Get public profile of any user |
| GET | `/users/admin/all` | ✅ | Admin | Get all users (paginated) |
| PUT | `/users/admin/:id/role` | ✅ | Admin | Update a user's role (`user` / admin) |
| DELETE | `/users/admin/:id` | ✅ | Admin | Delete a user and all their data |

**Pagination query params:** `?page=1&limit=10`

---

### Events — `/api/events`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/events` | ❌ | Get all events (paginated, filterable) |
| GET | `/events/:id` | ❌ | Get a single event |
| POST | `/events` | ✅ | Create a new event (Multipart Form) |
| PUT | `/events/:id` | ✅ | Update an event (Multipart Form) |
| DELETE | `/events/:id` | ✅ | Delete an event (organizer or admin only) |

**Filter query params:** `?page=1&limit=10&category=<id>&search=concert`

**Create / Update event body (`multipart/form-data`):**
> ⚠️ **Note:** When creating or updating an event with an image, the request `Content-Type` must be `multipart/form-data`. Coordinates must be sent as a stringified JSON array.

| Key | Type | Description |
|---|---|---|
| `title` | Text | "Tech Meetup Cairo" |
| `description` | Text | "A monthly tech gathering." |
| `date` | Text | "2025-09-01T18:00:00.000Z" |
| `coordinates` | Text | `[31.2357, 30.0444]` (Stringified Array) |
| `address` | Text | "Cairo, Egypt" |
| `capacity` | Text | `100` |
| `price` | Text | `0` |
| `category` | Text | `<category_id>` |
| `image` | File | Event cover image (jpg, png, webp) |

---

### Categories — `/api/categories`

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| GET | `/categories` | ❌ | — | Get all categories |
| GET | `/categories/:id` | ❌ | — | Get a single category |
| POST | `/categories` | ✅ | Admin | Create a category |
| PUT | `/categories/:id` | ✅ | Admin | Update a category |
| DELETE | `/categories/:id` | ✅ | Admin | Delete a category (events uncategorized) |

**Body:**
```json
{ "name": "Music" }
```

---

### Registrations — `/api/registrations`

All registration endpoints require authentication.

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/registrations/:id/register` | ✅ | Register for an event — returns ticket with QR code |
| DELETE | `/registrations/:id/cancel` | ✅ | Cancel registration (restores capacity) |
| GET | `/registrations/:id/attendees` | ✅ | Get attendees list (organizer or admin only) |

---

## Security

- All routes under `/api` are rate-limited to **100 requests per 15 minutes** per IP.
- Passwords are hashed with **bcrypt** (10 rounds).
- Refresh tokens are hashed with **bcrypt** before database storage.
- Request bodies are sanitized against **NoSQL injection** via `express-mongo-sanitize`.
- HTTP headers are secured with **Helmet**.
- Refresh token cookie is set with `httpOnly: true` and `sameSite: strict`.

---

## Project Structure
Clean separation of concerns following MVC architecture.
```text
NextEvent/
├── controllers/         # Route handler logic
│   ├── authController.js
│   ├── userController.js
│   ├── eventController.js
│   ├── categoryController.js
│   └── registrationController.js
├── middlewares/
│   ├── authMW.js        # JWT authentication + role authorization
│   ├── uploadMW.js      # Multer & Cloudinary image upload config
│   ├── errorHandlingMW.js
│   └── notFoundMW.js
├── models/
│   ├── userModel.js
│   ├── eventModel.js
│   ├── categoryModel.js
│   ├── registrationModel.js
│   └── refreshTokenModel.js
├── routes/
│   ├── authRoute.js
│   ├── userRoute.js
│   ├── eventRoute.js
│   ├── categoryRoute.js
│   └── registrationRoute.js
├── validations/         # express-validator chains
├── utils/
│   └── httpError.js
├── app.js
├── server.js
└── .env.example
```