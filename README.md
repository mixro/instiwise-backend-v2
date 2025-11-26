# InstiWise – Full-Stack Institute Management & Collaboration Platform  
**Technical Documentation**

![Node.js](https://img.shields.io/badge/Node.js-v20.x-green)
![Express.js](https://img.shields.io/badge/Express.js-v4.x-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-v7-green)
![Redis](https://img.shields.io/badge/Redis-v7-red)
![JWT + HttpOnly Cookies](https://img.shields.io/badge/Auth-JWT%20%2B%20Refresh%20Tokens-blue)
![Google OAuth](https://img.shields.io/badge/Google%20Login-Supported-brightgreen)

**InstiWise** is a modern, secure, and intelligent full-stack platform built for educational institutions. It connects students, lecturers, and staff through real-time academic tools: news & announcements, event scheduling, project showcase, social networking, favorites system, and campus-wide collaboration — all in one centralized, beautiful experience.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [Environment Variables](#environment-variables)
- [Authentication System](#authentication-system)
- [Key Features & Endpoints](#key-features--endpoints)
- [Security Practices](#security-practices)
- [Database Design](#database-design)
- [Performance & Scalability](#performance--scalability)
- [Testing](#testing)
- [Deployment](#deployment)
- [Future Roadmap](#future-roadmap)

## Overview

InstiWise transforms traditional campus communication into a smart, connected ecosystem. Students can explore projects, follow events, receive instant news, build networks, and stay updated — while faculty and admins manage content efficiently with role-based controls.

## Features

- Secure authentication (Email/Password + Google OAuth)
- 90-day access + 180-day refresh tokens (HttpOnly cookies)
- Personal username setup after registration
- Public & per-user event favorites (array-based)
- Real-time event classification: Upcoming / Ongoing / Past
- News with unique view tracking
- Project showcase with ownership protection
- Profile management (username, email, bio, image)
- Admin panel capabilities
- Redis-backed token blacklisting on logout

## Architecture

**Backend**: RESTful API with clean MVC pattern  
**Database**: MongoDB (Mongoose ODM)  
**Cache/Revocation**: Redis  
**Auth Flow**: JWT access + refresh tokens in HttpOnly cookies  
**OAuth**: Google Sign-In (one-tap register/login)

## Tech Stack

| Layer             | Technology                                 |
|------------------|---------------------------------------------|
| Runtime          | Node.js v20+                                |
| Framework        | Express.js                                  |
| Database         | MongoDB Atlas / Local                       |
| Cache            | Redis (Cloud or Local)                      |
| Auth             | JWT, bcryptjs, google-auth-library          |
| Validation       | express-validator                           |
| Date Handling    | date-fns                                    |
| Environment      | dotenv                                      |
| Testing          | Postman, Manual, Unit (planned)             |

## Project Structure

```plaintext
instiwise-backend-v2/
├── config/              # DB & Redis connections
│   └── mongodb.js
│   └── redis.js
├── controllers/         # Business logic
│   ├── authController.js
│   ├── userController.js
│   ├── newsController.js
│   ├── eventController.js
│   └── projectController.js
├── middleware/          # Custom middleware
│   ├── auth.js          # authenticateToken
│   ├── ownsProject.js   # Ownership check
│   └── validate.js
├── models/              # Mongoose schemas
│   ├── User.js
│   ├── New.js           # News (intentionally named "New")
│   ├── Event.js
│   └── Project.js
├── routes/              # Express routers
│   ├── auth.js
│   ├── user.js
│   ├── news.js
│   ├── event.js
│   └── project.js
├── utils/               # Reusable helpers
│   ├── tokenUtils.js
│   ├── dateTimeUtils.js
│   └── googleClient.js
├── scripts/             # One-time scripts
│   └── backfillEventDateTime.js
├── .env                 # Environment variables
├── .gitignore
├── package.json
└── server.js            # Entry point
```

## Setup Instructions

```bash
# 1. Clone & install
git clone https://github.com/yourusername/instiwise-backend-v2.git
cd instiwise-backend-v2
npm install

# 2. Create .env (see below)

# 3. Run MongoDB & Redis locally or use cloud

# 4. Start server
npm run dev    # with nodemon
# or
npm start
```

Server runs at `http://localhost:8800`

## Environment Variables (`.env`)

```env
PORT=8800
MONGO_URI=mongodb://localhost:27017/instiwise
REDIS_URL=redis://default:password@localhost:6379

JWT_SECRET=your_very_long_random_secret_here
JWT_REFRESH_SECRET=another_long_different_secret_here

GOOGLE_WEB_CLIENT_ID=999999999999-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com

NODE_ENV=development
```

## Authentication System

| Feature                     | Implementation                                      |
|----------------------------|------------------------------------------------------|
| Register / Login           | Email + Password (bcrypt)                            |
| Google OAuth               | Single `/auth/google` route (login = register)       |
| Tokens                     | Access: 90 days, Refresh: 180 days (HttpOnly cookie) |
| Refresh Endpoint           | POST `/auth/refresh`                                 |
| Logout                     | Blacklists both tokens in Redis                      |
| Protected Routes           | `authenticateToken` middleware                       |

## Key Features & Endpoints

### Auth (`/api/v1/auth`)
- `POST /register`, `/login`, `/google`
- `POST /refresh`, `/logout`
- `POST /setup-username` (after register)

### Users (`/api/v1/users`)
- `GET /me`, `PUT /:id` (self or admin), `POST /me/change-password`

### News (`/api/v1/news`)
- `POST /:id/view` → unique views per user
- Full CRUD (creator only)

### Events (`/api/v1/events`)
- `GET /upcoming` (limited to 4 most recent)
- `GET /ongoing`, `/past`
- `PATCH /:id/favorite` → per-user favorites
- `GET /favorites`

### Projects (`/api/v1/projects`)
- CRUD with ownership protection via `ownsProject` middleware

## Security Practices

- HttpOnly, Secure, SameSite=Strict refresh cookies
- Redis token blacklisting on logout
- Google token verification + email_verified check
- Rate limiting ready (add later)
- Input validation & sanitization
- Ownership checks on sensitive actions
- Password optional for Google users
- Clock skew tolerance in Google auth

## Database Design (Key Models)

```js
User → googleId?, email (unique), username (unique), password?, isVerified
Event → userId, date, start, end, dateTime (Date), favorites: [String]
New → views: [String], likes/dislikes: [String]
Project → userId (owner), title, desc, etc.
```

## Performance & Scalability

- `dateTime: Date` field on Event → indexed, fast upcoming queries
- Redis for token revocation
- Compound indexes on frequently queried fields
- Lean queries & selective field selection

## Testing

Tested extensively with:
- Postman collections
- Manual flow testing
- Google OAuth Playground
- Real devices (clock sync verified)

## Deployment

Ready for:
- Render / Railway / Vercel (Node)
- Docker (planned)
- MongoDB Atlas + Redis Cloud

## Future Roadmap

- Push notifications for events/news
- Real-time chat (Socket.IO)
- Mobile app deep linking
- Admin dashboard analytics
- Email notifications
- File uploads (Cloudinary)
- Rate limiting & CORS hardening

