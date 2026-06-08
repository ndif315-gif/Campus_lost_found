# Campus Lost & Found System

A web-based application that helps students and staff report, search, and recover lost or found items on campus.

## Features

### User Management
- User Registration
- User Login
- JWT Authentication
- Secure Password Storage

### Lost & Found Management
- Report Lost Items
- Report Found Items
- View Lost Items
- View Found Items

### Matching System
- Compare Lost and Found Items
- Store Potential Matches
- Generate Notifications

### Notifications
- Notify Users When a Match Is Found
- View Notifications Dashboard

---

# Technology Stack

## Backend
- Node.js
- Express.js
- MySQL
- JWT Authentication
- bcryptjs

## Frontend
- HTML5
- CSS3
- JavaScript

## Database
- MySQL

---

# Project Structure

```text
campus-lost-found8

backend
│
├── config
│   └── db.js
│
├── controllers
│   ├── authController.js
│   ├── lostController.js
│   ├── foundController.js
│   ├── matchController.js
│   └── notificationController.js
│
├── middleware
│   └── authMiddleware.js
│
├── models
│   ├── User.js
│   ├── LostItem.js
│   ├── FoundItem.js
│   ├── Match.js
│   └── Notification.js
│
├── routes
│   ├── authRoutes.js
│   ├── lostRoutes.js
│   ├── foundRoutes.js
│   ├── matchRoutes.js
│   └── notificationRoutes.js
│
├── .env
├── package.json
├── database.sql
└── server.js

frontend
│
├── index.html
├── login.html
├── register.html
├── dashboard.html
├── report-lost.html
├── report-found.html
├── notifications.html
│
├── css
│   └── style.css
│
├── js
│   ├── auth.js
│   ├── dashboard.js
│   ├── lost.js
│   ├── found.js
│   └── notifications.js
│
└── images
```

---

# Installation

## Clone Repository

```bash
git clone <repository-url>
cd campus-lost-found8
```

---

## Install Backend Dependencies

```bash
cd backend
npm install
```

---

# Database Setup

Open MySQL and run:

```sql
CREATE DATABASE campus_lost_found8;
```

Import:

```bash
mysql -u root -p campus_lost_found8 < database.sql
```

Verify:

```sql
USE campus_lost_found8;
SHOW TABLES;
```

Expected tables:

- users
- lost_items
- found_items
- matches
- notifications

---

# Environment Variables

Create a `.env` file inside the backend folder.

```env
PORT=5000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=campus_lost_found8

JWT_SECRET=campus_lost_found8_secret_key_2026
```

---

# Running the Backend

```bash
cd backend
node server.js
```

Expected:

```text
Server running on port 5000
```

Backend URL:

```text
http://localhost:5000
```

---

# Running the Frontend

Open a new terminal:

```bash
cd frontend
```

Using Live Server:

```bash
live-server
```

Or open:

```text
login.html
```

directly in your browser.

---

# API Endpoints

## Authentication

### Register

```http
POST /api/auth/register
```

### Login

```http
POST /api/auth/login
```

---

## Lost Items

### Create Lost Item

```http
POST /api/lost
```

### View Lost Items

```http
GET /api/lost
```

---

## Found Items

### Create Found Item

```http
POST /api/found
```

### View Found Items

```http
GET /api/found
```

---

## Matching

### Run Matching Process

```http
GET /api/match/run
```

---

## Notifications

### Get User Notifications

```http
GET /api/notifications
```

---

# Testing

Check server:

```bash
curl http://localhost:5000
```

Check database connection:

```bash
curl http://localhost:5000/api/test-db
```

---

# OOP Concepts Used

### Encapsulation
Business logic is separated into controllers.

### Abstraction
Routes interact with controllers instead of directly accessing the database.

### Modularity
The project is divided into:
- Controllers
- Routes
- Middleware
- Models
- Configuration

### Association
A User can own:
- Lost Items
- Found Items
- Notifications

---

# Future Improvements

- Upload item images
- Advanced matching algorithm
- English/French language switch
- Admin dashboard
- Email notifications
- Mobile responsive UI
- Search and filtering

---

# Authors

Group 8
ICT UNIVERSITY
lectred and cotroled by Engineer oalma
Campus Lost & Found Management System

2026
# campus-lost-found
