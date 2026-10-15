# Selam Consulting Architects & Engineers PLC — Enterprise Web Platform

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](file:///c:/Users/shafqat%20Ali/Desktop/Project/selam)
[![Frontend](https://img.shields.io/badge/Frontend-React%2019%20%7C%20Vite-61DAFB.svg)](file:///c:/Users/shafqat%20Ali/Desktop/Project/selam/frontend)
[![Backend](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-green.svg)](file:///c:/Users/shafqat%20Ali/Desktop/Project/selam/backend)
[![Database](https://img.shields.io/badge/Database-MongoDB%20%7C%20Mongoose-47A248.svg)](file:///c:/Users/shafqat%20Ali/Desktop/Project/selam/backend)
[![License](https://img.shields.io/badge/License-Proprietary%20%2F%20Commercial-red.svg)](file:///c:/Users/shafqat%20Ali/Desktop/Project/selam)


## 📋 Executive Overview

This repository contains the complete, production-grade web platform and administrative content management system engineered for **Selam Consulting Architects & Engineers PLC** (Category-1 registered consulting firm in Ethiopia).

The platform delivers a modern, high-performance digital presence to showcase architectural and structural engineering portfolios, deliver firm information, engage prospective clients via an automated interactive chatbot, receive customer project inquiries with calendar conversions, and empower non-technical administrators with a secure, real-time management dashboard.

---

## 🌟 Key Features

### 🏛️ Public Client Website
- **Modern Responsive Design**: Bespoke architectural aesthetic with micro-interactions, mobile-first navigation, and fluid animations.
- **Dynamic Portfolio Showcase**: Filterable showcase of commercial, residential, and public projects with high-resolution imagery and specifications.
- **Service Catalog**: Detailed service breakdown covering architectural design, structural analysis (ETABS, SAP2000, STAAD), MEP, landscape design, BOQ preparation, and asset valuation.
- **Team & Leadership Directory**: Interactive staff directory highlighting department heads, credentials, and years of experience.
- **Careers & Job Postings**: Live job listings with application deadlines, department tags, and position descriptions.
- **Consultation & Lead Inquiries**: Contact capture form with real-time validation and Ethiopian/Gregorian date handling.
- **Integrated Architecture Chatbot**: Intelligent automated assistant answering inquiries about services, licensing (Category-1), office branches (Addis Ababa & Hawassa), fees, and workflows.

### 🛡️ Administrative Portal (`/admin`)
- **Secure JWT Authentication**: Role-based authentication with bcrypt password hashing and 7-day token persistence.
- **Live Business Dashboard**: Real-time metrics overview (total inquiries, active projects, team members, open job postings).
- **Inquiry Management**: Review, filter, and delete customer consultation requests and messages.
- **Project CMS**: Create, update, reorder, feature, and delete portfolio projects with direct image URL support (including Google Drive direct links).
- **Team Management**: Add, update, and manage architects, engineers, and administrative staff profiles.
- **Careers CMS**: Post, edit, activate/deactivate, and delete career openings.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, React Router v7, Vite 8, Vanilla CSS (Custom Design System), Oxlint |
| **Backend** | Node.js (v18+), Express.js 4, CORS, Dotenv |
| **Database** | MongoDB 6+, Mongoose 8 (ODM) |
| **Authentication** | JSON Web Tokens (`jsonwebtoken`), `bcryptjs` |
| **Assets & Media** | Optimized static assets + Google Drive direct view integration |

---

## 📁 Project Structure

```text
selam/
├── README.md                      # Primary project & client handover documentation
│
├── backend/                       # RESTful API & Server
│   ├── .env.example               # Template environment configuration
│   ├── .env                       # Active environment configuration (git-ignored)
│   ├── package.json               # Backend dependencies & npm scripts
│   ├── server.js                  # Application entry point, CORS & database connection
│   ├── seed.js                    # Database seeder (sample projects, team, jobs)
│   ├── middleware/
│   │   └── auth.js                # JWT verification & role validation middleware
│   ├── models/
│   │   ├── Job.js                 # Career vacancy schema
│   │   ├── Project.js             # Portfolio project schema
│   │   ├── Submission.js          # Contact inquiry schema
│   │   ├── TeamMember.js          # Staff & specialist schema
│   │   └── User.js                # Admin user & password hashing schema
│   └── routes/
│       ├── auth.js                # Login, verification & default admin seeding
│       ├── contact.js             # Public submission & protected inquiry CRUD
│       ├── jobs.js                # Job listings endpoints (public + admin)
│       ├── projects.js            # Project portfolio endpoints (public + admin)
│       ├── stats.js               # Administrative summary statistics
│       └── team.js                # Team members endpoints (public + admin)
│
└── frontend/                      # React Single Page Application (SPA)
    ├── .env.example               # Template frontend environment variables
    ├── package.json               # Frontend dependencies & Vite scripts
    ├── vite.config.js             # Vite configuration with backend proxy
    ├── index.html                 # HTML5 document template
    ├── admin.css                  # Admin portal dedicated stylesheet
    ├── style.css                  # Public application core stylesheet
    ├── public/                    # Static files served directly
    └── src/
        ├── main.jsx               # React DOM entry point
        ├── App.jsx                # Application routing & layout frame
        ├── components/
        │   ├── Navbar.jsx         # Primary navigation & responsive mobile drawer
        │   ├── Footer.jsx         # Global footer with office locations & quick links
        │   └── Chatbot.jsx        # Architectural consulting automated assistant
        ├── pages/
        │   ├── Home.jsx           # Landing page with hero banner & highlights
        │   ├── About.jsx          # Firm history, vision, and Category-1 credentials
        │   ├── Services.jsx       # Comprehensive engineering & architectural services
        │   ├── Projects.jsx       # Filterable portfolio gallery
        │   ├── Team.jsx           # Staff & leadership directory
        │   ├── Contact.jsx        # Inquiry form & office maps
        │   └── Admin.jsx          # Secure administrative dashboard & CMS
        └── utils/
            ├── api.js             # API base URL resolver & Google Drive link transformer
            └── calendar.js        # Ethiopian Calendar conversion utilities
```

---

## ⚡ Quick Start Guide (Development)

### 1. Prerequisites
Ensure the following tools are installed on your host system:
- **Node.js**: v18.0.0 or higher ([Download Node.js](https://nodejs.org/))
- **npm**: v9.0.0 or higher (packaged with Node.js)
- **MongoDB**: A running local MongoDB instance or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cloud cluster.

---

### 2. Backend Setup

1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Install the server dependencies:
   ```bash
   npm install
   ```

3. Create your `.env` configuration file from the template:
   ```bash
   # On Windows (PowerShell):
   Copy-Item .env.example .env

   # On macOS / Linux:
   cp .env.example .env
   ```

4. Open `.env` and verify your MongoDB URI and secrets (see [Environment Variables](#-environment-variables-reference)).

5. **(Optional but Recommended)** Seed the database with initial portfolio data, staff directory, and job listings:
   ```bash
   npm run seed
   ```

6. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The API will start at:* `http://localhost:5000`

---

### 3. Frontend Setup

1. Open a second terminal window and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install the client dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The application will open automatically at:* `http://localhost:3000`

> **Note on Local Proxy:** In development, Vite automatically proxies any requests to `/api/*` to `http://localhost:5000`, preventing any CORS issues.

---

## ⚙️ Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Description | Example / Default | Required |
| :--- | :--- | :--- | :---: |
| `MONGODB_URI` | MongoDB connection URI (Local or Atlas) | `mongodb://127.0.0.1:27017/selam_consulting` | **Yes** |
| `PORT` | Port the Express server listens on | `5000` | No (Default: 5000) |
| `JWT_SECRET` | Secret key used to sign and verify JSON Web Tokens | `your_strong_random_secret_key_here` | **Yes** |
| `ADMIN_EMAIL` | Default administrator email created on first run | `admin@selam.com` | **Yes** |
| `ADMIN_PASSWORD` | Default administrator password created on first run | `admin123` | **Yes** |
| `ALLOWED_ORIGINS` | Comma-separated list of allowed frontend URLs for CORS | `http://localhost:3000,http://127.0.0.1:3000` | **Yes** |

### Frontend (`frontend/.env`)

| Variable | Description | Default (Dev) | Production Example |
| :--- | :--- | :--- | :--- |
| `VITE_API_BASE` | Base URL of the backend API without trailing slash | `""` (Empty string leverages Vite dev proxy) | `https://api.yourdomain.com` |

---

## 🔐 Administrative Access & Credentials

When the backend starts for the first time, it automatically creates a default administrator account using the values configured in `backend/.env`.

- **Admin Portal URL**: `http://localhost:3000/admin`
- **Default Email**: `admin@selam.com`
- **Default Password**: `admin123`

> [!CAUTION]
> **Production Security Mandatory Step**:
> Before deploying to a live public server, update `ADMIN_PASSWORD` and `JWT_SECRET` in `backend/.env` with strong, cryptographically secure values. Once the database is created, admin passwords can also be updated directly in MongoDB or via a password reset script.

---

## 📡 API Reference

All endpoints are prefixed with `/api`.

### Public Endpoints

| Method | Endpoint | Description | Request Body |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Healthcheck and timestamp | None |
| `GET` | `/api/projects` | List all portfolio projects | None |
| `GET` | `/api/team` | List all active team members | None |
| `GET` | `/api/jobs` | List active job vacancies | None |
| `POST` | `/api/contact` | Submit a client inquiry | `{ name, email, phone, service, message, preferredDate }` |

### Protected Endpoints (Requires `Authorization: Bearer <TOKEN>`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Authenticate admin user (`{ identifier, password }`) |
| `GET` | `/api/auth/me` | Validate session token & retrieve admin profile |
| `GET` | `/api/stats` | Dashboard statistics (counts and recent messages) |
| `GET` | `/api/contact` | Retrieve all customer inquiry messages |
| `DELETE` | `/api/contact/:id` | Delete an inquiry message |
| `POST` | `/api/projects` | Create a new project item |
| `PUT` | `/api/projects/:id` | Update an existing project item |
| `DELETE` | `/api/projects/:id` | Remove a project item |
| `POST` | `/api/team` | Add a new team member |
| `PUT` | `/api/team/:id` | Update team member information |
| `DELETE` | `/api/team/:id` | Remove a team member |
| `GET` | `/api/jobs/all` | List all job postings (active and inactive) |
| `POST` | `/api/jobs` | Create a new career opening |
| `PUT` | `/api/jobs/:id` | Update an existing career opening |
| `DELETE` | `/api/jobs/:id` | Remove a career opening |

---

## 🚀 Production Deployment Guide

### Option 1: Standard VPS / Cloud Server (Ubuntu / Nginx / PM2)

#### 1. Backend Service
1. Install Node.js and PM2 globally:
   ```bash
   npm install -g pm2
   ```
2. Navigate to `backend/` and configure production `.env` (pointing to MongoDB Atlas).
3. Start the service with PM2:
   ```bash
   pm2 start server.js --name "selam-api"
   pm2 save
   pm2 startup
   ```

#### 2. Frontend Production Build
1. In `frontend/`, create `.env` with your live API domain:
   ```env
   VITE_API_BASE=https://api.selamconsulting.com
   ```
2. Build the optimized static assets:
   ```bash
   npm run build
   ```
   The production files will be output to the `frontend/dist/` directory.
3. Configure **Nginx** to serve `frontend/dist/` with SPA fallback:
   ```nginx
   server {
       listen 80;
       server_name selamconsulting.com www.selamconsulting.com;

       root /var/www/selam/frontend/dist;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }

       location /api/ {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

---

### Option 2: Cloud Platform Deployment (PaaS)

- **Frontend**: Deploy `frontend/` to **Vercel**, **Netlify**, or **Cloudflare Pages**.
  - Build Command: `npm run build`
  - Output Directory: `dist`
  - Environment Variable: `VITE_API_BASE=https://your-backend-api.onrender.com`
- **Backend**: Deploy `backend/` to **Render**, **Railway**, or **Heroku**.
  - Root Directory: `backend`
  - Build Command: `npm install`
  - Start Command: `npm start`
  - Set all environment variables (`MONGODB_URI`, `JWT_SECRET`, `ALLOWED_ORIGINS`).
- **Database**: Host on **MongoDB Atlas** with a dedicated user and IP whitelist (`0.0.0.0/0` or cloud provider IP).

---

## 🔒 Security & Best Practices Checklist

- [x] **Password Encryption**: All admin passwords hashed using industry-standard `bcryptjs` (salt factor 10).
- [x] **CORS Protection**: Restricted to allowed origins specified in `.env`.
- [x] **Sanitization & Validation**: Input sanitization on login and contact submission forms.
- [x] **Separation of Concerns**: Decoupled client application and RESTful backend architecture.
- [ ] **SSL / TLS Certificate**: Ensure HTTPS is enforced on production domains (e.g., via Let's Encrypt / Certbot / Cloudflare).
- [ ] **Routine Database Backups**: Schedule automated daily backups via MongoDB Atlas snapshot manager.

---

## 📦 Client Handover & Acceptance Sign-off

| Deliverable | Description | Status |
| :--- | :--- | :---: |
| **Source Code** | Complete frontend, backend, schemas, seeders, and stylesheets | Delivered |
| **Admin Portal** | Complete CMS for projects, team, careers, and inquiries | Delivered |
| **Interactive Bot** | Architecture & engineering consultation chatbot | Delivered |
| **Ethiopian Calendar** | Support for local calendar display & conversions | Delivered |
| **Documentation** | Client-ready setup, architecture, and deployment instructions | Delivered |

For technical inquiries, feature upgrades, or maintenance assistance, please contact the development engineering lead.
