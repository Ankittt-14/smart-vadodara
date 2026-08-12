# Smart Vadodara — AI-Based Civic Issue Monitoring & Management System

> **A Next-Generation Municipal Governance & AI-Driven Issue Resolution Platform for Vadodara Municipal Corporation (VMC).**

Smart Vadodara is an end-to-end full-stack civic monitoring platform that leverages an **AI Processing Hub** to automate the detection, geofencing, spam filtering, risk scoring, and routing of civic complaints (e.g., potholes, garbage accumulation, waterlogging, streetlight faults, and illegal construction). 

The platform bridges the gap between **citizens**, **Ward Engineers**, and **Municipal Administrators** through real-time GIS mapping, automated proof-of-work verification, and interactive public outcome dashboards.

---

## 🌟 Key Features & Modules

### 1. 📱 Citizen Issue Reporting Portal (`/report`)
- **Seamless Issue Reporting**: Citizens and VMC staff can submit civic issues with photographs, category hints, and descriptions.
- **Automated GPS & Interactive Map**: Built-in Leaflet geolocation picker allowing users to pin the exact coordinates of an incident in Vadodara.
- **Instant OTP & Password Authentication**: Easy mobile OTP login for citizens without friction, as well as full email-password authentication.

### 2. 🤖 AI Processing Hub (`/processing/:id`)
- **Real-Time Automated Triage**: Processes every submission instantly upon receipt.
- **Categorization Engine**: Classifies issues into standardized categories (Pothole, Garbage, Waterlogging, Streetlight Fault, Illegal Construction) with confidence scores.
- **Smart Geofencing**: Uses spatial calculations to automatically assign issues to the correct Vadodara municipal ward and default Ward Engineer.
- **Anti-Spam & Duplicate Filter**: Automatically identifies duplicate reports within an 80-meter radius over a 14-day temporal window.
- **Dynamic Risk Matrix**: Computes a numerical risk score (5–100) and assigns severity levels (**Low**, **Moderate**, **High**, **Critical**) based on issue type and local cluster density.

### 3. 👷 Ward Engineer & Officer Dashboard (`/ward-dashboard`)
- **Role-Based Task Management**: Ward engineers log in to view their assigned worklist prioritized by risk severity.
- **Status Progression**: Progress issues from `Pending Review` → `In Progress` → `Fixed - Pending AI Review` → `Verified`.
- **Proof-of-Work Verification**: Engineers upload photos of completed repair work. The AI Hub automatically analyzes and validates the proof photo before marking the issue as `Verified`.

### 4. 📊 Public Outcome & Municipal Dashboard (`/outcome`)
- **Ward Health Index**: Live ward scoring (0–100 scale) calculated dynamically based on total open, high-risk, and resolved issues.
- **Interactive VMC Live Map**: Color-coded map markers displaying open issues across all Vadodara wards.
- **Critical Risk Alerts**: High-priority feed alerting administrators to severe infrastructure hazards.
- **Transparent Public Activity Log**: Live stream of recently logged and resolved civic issues.

---

## 📐 System Architecture & Tech Stack

```
+-----------------------------------------------------------------------------------+
|                                 SMART VADODARA                                    |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|   +--------------------------+                     +--------------------------+   |
|   |    React (Vite) Client   | <==== REST / JWT ==>|   Node.js Express Server |   |
|   +--------------------------+                     +--------------------------+   |
|   | • Tailwind CSS           |                     | • Express Router         |   |
|   | • Leaflet Maps           |                     | • JWT Authentication     |   |
|   | • Lucide Icons           |                     | • Multer File Uploads    |   |
|   | • Context API / Auth     |                     | • SQLite (better-sqlite3)|   |
|   +--------------------------+                     +--------------------------+   |
|                                                                 ||                |
|                                                                 \/                |
|                                                    +--------------------------+   |
|                                                    |    AI Processing Hub     |   |
|                                                    +--------------------------+   |
|                                                    | • Heuristic Classifier  |   |
|                                                    | • Haversine Geofencing   |   |
|                                                    | • Duplicate/Spam Engine  |   |
|                                                    | • Risk Scoring Matrix    |   |
|                                                    | • Proof AI Verifier      |   |
|                                                    +--------------------------+   |
+-----------------------------------------------------------------------------------+
```

### Stack Breakdown

- **Frontend**: React 18, Vite, Tailwind CSS, React Router DOM, Leaflet / React-Leaflet, Lucide React Icons.
- **Backend**: Node.js, Express.js, JWT (`jsonwebtoken`), Password Hashing (`bcryptjs`), Multer file storage.
- **Database**: SQLite powered by `better-sqlite3` with WAL mode enabled for fast local data persistence.
- **AI Processing Engine**: Rule-based, deterministic heuristic AI pipeline (`server/aiHub.js`). Zero external dependencies, offline execution, instant response time.

---

## 🧠 How the AI Processing Hub Works (Viva & Presentation Guide)

The AI Processing Hub (`server/aiHub.js`) simulates an enterprise AI pipeline with deterministic, explainable rules:

```
[ Citizen Submission ] 
       │
       ▼
1. Classification Engine ────► Keyword Heuristic + Hash Fallback (Confidence Score)
       │
       ▼
2. Spatial Geofencing ──────► Haversine Formula vs. Vadodara Ward Coordinates
       │
       ▼
3. Spam & Duplicate Check ──► 80m Radius & 14-Day Window Lookup
       │
       ▼
4. Risk Prediction Model ───► Base Category Weight + 300m Open Issue Density Weight
       │
       ▼
5. Proof AI Verification ───► Resolution Photo Validation (Pass/Fail)
```

1. **Classification Engine**: Parses user description and filename metadata using natural language keywords. If keywords are absent, it uses a deterministic string hash fallback so identical inputs always return consistent categories.
2. **Haversine Geofencing**: Computes the exact great-circle distance between the issue GPS coordinates and pre-configured Vadodara municipal wards to assign the closest ward:
   $$d = 2R \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta \phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta \lambda}{2}\right)}\right)$$
3. **Duplicate & Spam Filter**: Queries open database reports within an **80-meter spatial radius** logged in the last **14 days**. Flags short or invalid texts as spam.
4. **Dynamic Risk Scoring**: Calculates risk severity based on base category urgency plus nearby unresolved issue density within **300 meters**:
   - `Pothole`: 55 base score
   - `Waterlogging`: 70 base score
   - `Garbage`: 35 base score
   - `Streetlight Fault`: 40 base score
   - `Illegal Construction`: 50 base score
   - *Risk Levels*: **Low** (<30), **Moderate** (30-54), **High** (55-74), **Critical** (≥75).
5. **AI Proof Validation**: Runs an automated check on engineer repair photos to ensure valid proof before marking tasks as `Verified`.

---

## 🔑 Demo Accounts & Credentials

You can test all user roles out of the box using these pre-seeded credentials:

| Role | Email / Contact | Password | Access Level & Capabilities |
| :--- | :--- | :--- | :--- |
| **Ward Officer** | `ankit@gmail.com` | `12345` | Manages Ward 1 (Sayajigunj) worklist, updates issue status, uploads fix proof. |
| **Municipal Admin** | `admin@vmc.gov.in` | `12345` | VMC Commissioner overview across all wards, views stats & risk alerts. |
| **Citizen User** | `citizen@vadodara.in` | `12345` | Reports issues, views AI processing results and public outcome dashboard. |
| **Citizen Quick Login**| Mobile OTP (`9876543210`)| OTP (Any 4 digits)| Fast OTP login for citizens without registration requirement. |

---

## 🗄️ Database Schema

The SQLite database (`server/vadodara.db`) consists of four primary relational tables:

- **`wards`**: `id`, `name`, `lat`, `lng`
- **`engineers`**: `id`, `name`, `ward_id`
- **`users`**: `id`, `email`, `password`, `name`, `role`, `ward_id`, `created_at`
- **`issues`**: `id` (e.g. `VMC-2026-X9K2L`), `category`, `description`, `lat`, `lng`, `ward_id`, `reporter_type`, `image_path`, `status`, `risk_score`, `risk_level`, `is_duplicate`, `duplicate_of`, `is_spam`, `confidence`, `assigned_engineer_id`, `proof_image_path`, `ai_validated`, `created_at`, `resolved_at`

---

## 📡 API Reference

### Auth Endpoints
- `POST /api/auth/register` — Register a new citizen or ward officer.
- `POST /api/auth/login` — Authenticate user and receive JWT.
- `POST /api/auth/citizen-otp` — Instant mobile number authentication.
- `GET /api/auth/me` — Retrieve authenticated user profile.

### Metadata & Wards
- `GET /api/wards` — List all 8 Vadodara wards.
- `GET /api/engineers` — List all assigned municipal engineers.

### Issues & AI Subsystem
- `POST /api/issues` — Submit a new issue (Multipart form-data: `image`, `description`, `lat`, `lng`, `reporterType`). Triggers the full AI Processing Hub pipeline.
- `GET /api/issues` — Retrieve issues (filterable by `wardId`, `engineerId`, `status`).
- `GET /api/issues/latest` — Fetch the most recently submitted issue.
- `GET /api/issues/:id` — Get detailed breakdown and AI summary for a specific issue.
- `PATCH /api/issues/:id/assign` — Assign or reassign issue to an engineer.
- `PATCH /api/issues/:id/resolve` — (Auth required) Upload repair proof photo and trigger AI proof validation.

### Analytics & Metrics
- `GET /api/stats` — Ward health index, total active/resolved counts, confidence averages, high-risk alerts, map marker datasets.

---

## 🚀 Step-by-Step Installation & Running Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v16.x or higher)
- `npm` (v8.x or higher)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/Ankittt-14/smart-vadodara.git
cd smart-vadodara
```

---

### 2. Backend Setup (`server`)

Open a terminal and navigate to the `server` directory:

```bash
cd server
npm install
```

#### Seed the Database
Run the seed script to create the SQLite database, insert Vadodara wards, assigned engineers, and seed default user accounts:

```bash
npm run seed
```

#### Start Backend Server
```bash
npm start
```
The backend service will run at **`http://localhost:4000`**.

---

### 3. Frontend Setup (`client`)

Open a **second terminal** and navigate to the `client` directory:

```bash
cd client
npm install
```

#### Start Frontend Server
```bash
npm run dev
```
The client application will run at **`http://localhost:5173`**.

---

## 🗺️ Pre-Configured Vadodara Wards & Coordinates

| Ward ID | Ward Name | Latitude | Longitude | Assigned Engineer |
| :---: | :--- | :---: | :---: | :--- |
| **1** | Sayajigunj | 22.3125 | 73.1900 | Er. Ankit Sharma |
| **2** | Alkapuri | 22.3086 | 73.1662 | Er. Sneha Sharma |
| **3** | Manjalpur | 22.2762 | 73.1932 | Er. Vikram Desai |
| **4** | Gotri | 22.3164 | 73.1503 | Er. Ananya Roy |
| **5** | Karelibaug | 22.3225 | 73.2070 | Er. Suresh Mehta |
| **6** | Waghodia Road | 22.3193 | 73.2298 | Er. Priya Joshi |
| **7** | Fatehgunj | 22.3245 | 73.1815 | Er. Amit Parmar |
| **8** | Vasna Road | 22.2861 | 73.1738 | Er. Pooja Bhatt |

---

## 🔮 Future Enhancements & ML Integration Roadmap

While the system operates on a deterministic heuristic engine (ensuring 100% offline capability and zero API cost for demonstration purposes), it is structured to support real ML models seamlessly:

1. **Deep Learning Vision Classification**: Swap `classifyIssue()` in `server/aiHub.js` with a TensorFlow.js MobileNet or PyTorch YOLO model trained on urban Indian road and garbage datasets.
2. **Citizen SMS / WhatsApp Alerts**: Integrate Twilio / WhatsApp Business API to update citizens on resolution status.
3. **Automated Escalation Matrix**: Auto-escalate unresolved critical issues directly to the Municipal Commissioner after 48 hours.

---

## 📄 License

This project is open-source under the **MIT License**.

Developed for Smart City Vadodara Municipal Corporation (VMC) monitoring and academic demonstration.
