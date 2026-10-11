# Selam Consulting — Frontend Application

This directory contains the client-facing Single Page Application (SPA) and Administrative Portal for **Selam Consulting Architects & Engineers PLC**, built using **React 19**, **Vite**, and **React Router v7**.

> For full system documentation, backend API reference, and deployment guidelines, please refer to the primary project [README.md](../README.md).

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (Optional in Development)
Copy the example environment file:
```bash
cp .env.example .env
```
In local development, leave `VITE_API_BASE` blank. Vite will automatically proxy API requests to `http://localhost:5000`.

In production, set `VITE_API_BASE` to your live API domain:
```env
VITE_API_BASE=https://api.yourdomain.com
```

### 3. Start Development Server
```bash
npm run dev
```
The application will launch at `http://localhost:3000`.

### 4. Build for Production
```bash
npm run build
```
Compiled production-ready assets are generated in the `dist/` directory.

### 5. Preview Production Build
```bash
npm run preview
```

---

## 📂 Key Pages & Routes

- `/` — Homepage (Hero, statistics, featured projects, services overview, client testimonials)
- `/about` — About firm, history, licensing & Category-1 credentials
- `/services` — Detailed architectural, structural, MEP, and valuation services
- `/projects` — Interactive, filterable portfolio gallery
- `/team` — Directory of firm leadership, architects, and engineering staff
- `/contact` — Consultation booking & customer inquiry form with calendar integration
- `/admin` — Secure administrative portal (Projects CMS, Team CMS, Careers CMS, Inquiries)
