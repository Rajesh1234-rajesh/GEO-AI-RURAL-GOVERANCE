# GeoAI Rural Governance Intelligence Platform - Backend API

Production-ready Node.js, Express, and MongoDB backend for the Andhra Pradesh Rural Governance Intelligence Platform.

## Features
- **Authentication**: JWT token issuance, bcrypt password hashing, role-based protection (Citizen & Government).
- **Complaint Engine**: Full CRUD with auto-generated complaint IDs (`CMP-XXXX-XXXX`).
- **Smart Geocoding**: Automatic location geocoding via OpenStreetMap Nominatim with retry and rate-limiting.
- **AI Decision Support**: Modular AI service layer supporting Google Gemini API with fallback rule-based diagnostic engine.
- **Welfare Schemes**: MongoDB collection with automated citizen eligibility evaluator.
- **Field Teams**: Government response force management.
- **Analytics & GIS**: Geospatial endpoints and aggregated MongoDB metrics.

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` and configure:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/geoai_rural
JWT_SECRET=your_secret_jwt_key
JWT_EXPIRE=7d
AI_API_KEY=your_gemini_api_key (optional)
AI_PROVIDER=gemini
CORS_ORIGIN=http://localhost:5173
```

### 3. Seed Reference Data (Optional)
Populate Andhra Pradesh government welfare schemes and initial field teams (clearly labelled demo data):
```bash
npm run seed
```

### 4. Start Server
```bash
# Production mode
npm start

# Development mode (with nodemon)
npm run dev
```

## API Endpoints Reference

### Authentication
- `POST /api/auth/register` - Register Citizen or Government Official
- `POST /api/auth/login` - Sign in with credentials
- `POST /api/auth/forgot-password` - Request password reset
- `GET /api/auth/profile` - Get authenticated profile (JWT required)

### Complaints
- `POST /api/complaints` - Submit village complaint (Citizen)
- `GET /api/complaints` - List complaints with filters (Government)
- `GET /api/complaints/my` - List logged-in citizen's complaints (Citizen)
- `GET /api/complaints/:id` - Get complaint details
- `PATCH /api/complaints/:id/status` - Update status & officer notes (Government)
- `PATCH /api/complaints/:id/like` - Support/Like complaint
- `POST /api/complaints/:id/replies` - Post reply/remark
- `GET /api/complaints/:id/replies` - List replies

### Dashboard & Analytics
- `GET /api/dashboard/stats` - Public platform metrics (Villages, Total, Pending, Resolved, Teams)
- `GET /api/dashboard/citizen` - Citizen-specific grievance counts
- `GET /api/dashboard/government` - Administrative overview, category breakdown & district stats
- `GET /api/analytics/categories` - Category counts
- `GET /api/analytics/districts` - District grievance distribution
- `GET /api/analytics/trends` - Historical monthly trend timeline

### GIS & Mapping
- `GET /api/map/complaints` - Geocoded complaints for Leaflet canvas
- `GET /api/map/district/:district` - Complaints filtered by district

### Welfare Schemes & Teams
- `GET /api/schemes` - List active Andhra Pradesh welfare schemes
- `POST /api/schemes/check-eligibility` - Evaluate citizen criteria
- `GET /api/government-teams` - List active departmental response teams
- `POST /api/government-teams` - Register new team (Government)

### AI Decision Support
- `POST /api/ai/complaint-insight` - Generate triage advice for a specific complaint
- `GET /api/ai/insights` - Category-level pattern analysis and recommendations
