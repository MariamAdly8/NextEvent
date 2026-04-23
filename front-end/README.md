# NextEvent — Frontend

A modern, full-featured event management platform built with **React 19**, **Redux Toolkit**, and **React Bootstrap**. NextEvent allows users to discover, create, and register for events, with a dedicated admin panel for platform management.

---

## 🚀 Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| React | 19 | UI framework |
| Redux Toolkit | 2.x | Global state management |
| React Router DOM | 7.x | Client-side routing |
| React Bootstrap | 2.x | UI component library |
| Bootstrap | 5.x | CSS framework |
| Axios | 1.x | HTTP client |
| React Leaflet | 5.x | Interactive maps |
| React Icons | 5.x | Icon library |
| Vite | 8.x | Build tool & dev server |

---

## 📁 Project Structure

```
src/
├── api/                        # API layer
│   ├── axiosInstance.js        # Axios setup + interceptors (auto token refresh)
│   ├── authApi.js              # Auth endpoints (login, signup, logout, refresh)
│   ├── usersApi.js             # User endpoints (profile, update, delete, admin)
│   ├── eventsApi.js            # Events CRUD endpoints
│   ├── categoriesApi.js        # Categories CRUD endpoints
│   ├── registrationsApi.js     # Registration endpoints
│   └── index.js                # Barrel exports
│
├── components/                 # Shared reusable components
│   ├── AttendeesModal/         # Modal showing event attendees list
│   ├── EventCard/              # Reusable event card (default + trending variants)
│   ├── Footer/                 # App footer
│   ├── Loader/                 # Spinner component (inline + fullscreen)
│   ├── NavBar/                 # Responsive navbar with search
│   ├── QRModal/                # QR code ticket modal with download support
│   └── ScrollToTop/            # Auto scroll to top on route change
│
├── layouts/
│   ├── MainLayout.jsx          # BrowserRouter + all routes + ProtectedRoute/AdminRoute
│   └── SharedLayout.jsx        # NavBar + Outlet + Footer wrapper
│
├── pages/
│   ├── AdminDashboard/         # Admin panel (users, events, categories)
│   ├── Calendar/               # Monthly events calendar view
│   ├── CreateEvent/            # Create new event form with map
│   ├── EditEvent/              # Edit existing event form with map
│   ├── EventDetails/           # Event detail page + register/cancel + QR ticket
│   ├── Explore/                # Browse & filter all events + pagination
│   ├── Home/                   # Landing page + trending events
│   ├── Login/                  # Login form
│   ├── NotFound/               # 404 page
│   ├── Profile/                # User profile + organized events management
│   ├── SignUp/                 # Registration form
│   └── Tickets/                # User's registered events (tickets) + QR codes
│
└── store/
    ├── store.js                # Redux store configuration
    ├── index.js                # Store barrel exports
    └── slices/
        ├── authSlice.js        # Auth state (login, logout, token, user)
        ├── userSlice.js        # User profile + registeredEvents state
        ├── eventsSlice.js      # Events state
        ├── categoriesSlice.js  # Categories state
        └── registrationsSlice.js # Registration state (incl. latestTicket + QR)
```

---

## ⚙️ Getting Started

### Prerequisites

- Node.js 18+
- npm
- A running backend server (see backend repo)

### Installation

```bash
# 1. Clone the repo
git clone <repository-url>
cd front-end

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your values (see Environment Variables section)

# 4. Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`

---

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:4000/api
```

| Variable | Description | Required |
|---|---|---|
| `VITE_API_URL` | Backend API base URL | ✅ Yes |

---

## 📜 Available Scripts

```bash
npm run dev        # Start development server (HMR)
npm run build      # Build for production
npm run preview    # Preview production build locally
npm run lint       # Run ESLint
```

---

## ✨ Features

### 👤 Authentication
- JWT-based auth with **access token** (localStorage) + **refresh token** (httpOnly cookie)
- Automatic token refresh on 401 — login/signup/logout routes are excluded from the interceptor
- Protected logout that clears both token and cookie

### 🏠 Home
- Hero section with animated glass cards
- Trending events section (top registered events)
- Dynamic CTA buttons based on auth state

### 🔍 Explore Events
- Search events by title with **500ms debounce**
- Filter by category
- Pagination (9 events per page)
- URL-synced search — NavBar search navigates to `/explore?search=...`

### 📅 Calendar
- Monthly view of all upcoming events
- Navigate between months
- Click events to go to event details

### 🎟️ Event Details
- Full event info with interactive **Leaflet map**
- Register / Cancel Registration with real-time button state update
- Sold out and past event handling
- **QR Ticket Modal** — opens automatically after successful registration, and available via "Show My Ticket QR" button on return visits

### 🎫 My Tickets
- All registered events displayed as cards with status badge
- **"Show Ticket QR"** button on each active ticket — opens a QR modal with a download option

### 🎫 QR Code Tickets
- Generated automatically by the backend upon registration
- Displayed in a modal immediately after registering for an event
- Accessible from the Event Details page or the My Tickets page
- Can be **downloaded as a PNG** directly from the modal
- QR code encodes: `registrationId`, `eventId`, and `userId` for verification at the event entrance

### 👤 Profile
- Edit display name inline
- Change password via modal
- Delete account (clears Redux state + redirects)
- Organized events with **Edit**, **Delete**, and **Attendees** actions
- Admin users see an **Admin Dashboard** button

### 🛡️ Admin Dashboard
Three tabs with full CRUD:

**Users Tab**
- Search users with debounce
- Paginated table
- Change user role (user ↔ admin)
- Delete user

**Events Tab**
- Search & paginate all events
- View event details
- View attendees via `AttendeesModal`
- Delete any event

**Categories Tab**
- Create new category
- Edit existing category
- Delete category

### 📝 Create / Edit Event
- Full form with validation
- Interactive **Leaflet map** for location picking
- Reverse geocoding via Nominatim API (auto-fills address from map click)
- Image upload support
- Edit page pre-fills existing event data and verifies organizer ownership

---

## 🔒 Route Protection

| Route | Access |
|---|---|
| `/login`, `/signup` | Public — redirects authenticated users to `/` |
| `/tickets` | Authenticated only — redirects to `/login` |
| `/create-event` | Authenticated only |
| `/events/:id/edit` | Organizer or Admin only — verified in component |
| `/admin` | Admin only — redirects non-admins to `/` |
| All others | Public |

---

## 🌐 API Integration

All API calls go through `axiosInstance` which handles:

- **Request interceptor** — attaches `Authorization: Bearer <token>` header automatically
- **Response interceptor** — on `401`, attempts token refresh once, then redirects to `/login` on failure
- **Auth route exclusion** — `/auth/login`, `/auth/signup`, `/auth/refresh`, `/auth/logout` bypass the refresh logic to prevent infinite loops

---

## 🎨 Design System

All pages use **CSS Modules** for scoped styling.

---

## 📋 Notes

- The app uses `react-leaflet` for maps. Leaflet marker icons are manually configured in `main.jsx` to fix the known Vite/Webpack bundling issue.
- The `EditEvent` page intentionally reuses `CreateEvent.module.css` since the layout is identical.
- The NavBar search on mobile is available inside the collapsed menu.
- Cookie-based refresh tokens require `withCredentials: true` on all Axios requests — already configured.
- QR codes are generated server-side as base64 PNG data URLs and stored on the registration document, so they are always available without regeneration.