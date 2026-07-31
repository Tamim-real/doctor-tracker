# 🏥 Hospital Analytics & Healthcare Management Portal

🚀 **Live Demo:** [https://doctor-tracker-01.vercel.app](https://doctor-tracker-01.vercel.app)

## Description
A modern, full-stack healthcare analytics and patient management platform designed to streamline administrative workflows, monitor system metrics, and track patient-doctor dynamics in real time. Built with Next.js, MongoDB, and Tailwind CSS, the system provides real-time data visualization through clean analytics dashboards, intuitive patient records management with advanced filtering, and efficient doctor profile allocation, empowering healthcare administrators to make data-driven operational decisions effortlessly.

---

## Setup Guide

Follow these step-by-step instructions to get the project running locally on your machine.

### Prerequisites
* **Node.js**: `v18.x` or higher
* **npm** or **yarn** or **pnpm**
* **MongoDB Instance**: Local MongoDB database or MongoDB Atlas URI

### Installation Steps

1. **Clone the Repository**
   ```bash
   git clone [https://github.com/Tamim-real/doctor-tracker.git](https://github.com/Tamim-real/doctor-tracker.git)
   cd doctor-tracker

   Install Dependencies

 ```Bash
npm install
Configure Environment Variables
Create a .env.local file in the root directory by duplicating the .env.example file:

Bash
cp .env.example .env.local
Fill in your specific environment variables in .env.local.

Start the Development Server

Bash
npm run dev
Open http://localhost:3000 in your browser to view the application.



.env.example File Content
Create a file named .env.example in your root directory containing:


# Database Configuration
MONGODB_URI=mongodb+srv://your_username:your_password@cluster.mongodb.net/doctor-tracker?retryWrites=true&w=majority

# Auth Secrets
NEXTAUTH_SECRET=your_nextauth_secret_key
JWT_SECRET=your_jwt_secret_key

# App Configuration
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000



System Architecture
The application follows a modern serverless Next.js App Router architecture, connecting a React Client UI directly to Mongoose-backed MongoDB database instances via Next.js API Routes.

+-----------------------------------------------------------------------+
|                               Client UI                               |
|       (Next.js App Router / React Components / Recharts / Shadcn)     |
+-----------------------------------+-----------------------------------+
                                    |
                                    | Fetch API Requests
                                    v
+-----------------------------------------------------------------------+
|                      Next.js Backend API Routes                       |
|           (/api/analytics | /api/doctors | /api/patients)             |
+-----------------------------------+-----------------------------------+
                                    |
                                    | Auth Verification & Middleware
                                    v
+-----------------------------------------------------------------------+
|                         Database Connection Layer                     |
|                             (Mongoose ODM)                            |
+-----------------------------------+-----------------------------------+
                                    |
                                    | Aggregation & CRUD Operations
                                    v
+-----------------------------------------------------------------------+
|                           MongoDB Database                            |
|                 (Collections: Doctors, Patients, Users)               |
+-----------------------------------+-----------------------------------+

### Data Flow

[Client UI / React] ---> (1) Trigger Action / Query Params
│
▼
[Next.js API Route] ---> (2) Parse Params & Apply Filters
│
▼
[Mongoose ODM]   ---> (3) Parallel Execution (Promise.all)
│
▼
[MongoDB Database]---> (4) Query Processing & Aggregation
│
▼
[Client Response]  <--- (5) Structured JSON & Pagination Payload 

```


1. **User Action & Request Trigger**: 
   The flow initiates when a user interacts with the UI—such as searching for a doctor/patient, adjusting date-range filters, toggling pagination, or loading dashboard analytics.

2. **API Query Parsing**: 
   Next.js App Router API endpoints capture incoming URL query parameters (`search`, `startDate`, `endDate`, `page`, `limit`) and dynamically build clean, sanitized MongoDB query objects.

3. **Optimized Database Processing**: 
   Mongoose ODM executes the database operations. To maximize efficiency, `Promise.all()` runs the document retrieval and the total document count in parallel, reducing overall network response times.

4. **Structured JSON Response**: 
   The server normalizes the processed data and sends back a structured JSON payload complete with accurate pagination metadata (`currentPage`, `totalPages`, `totalCount`, `hasMore`).



## Technical Decisions

### 1. Unified Dynamic Search using Regex Fallbacks over Native `$text` Indexing
* **Context**: Initially, standard `$text` index search was used for doctors and patients. However, if text indexes are not explicitly defined in the database schema, query execution throws internal server errors (`500`).
* **Decision**: Switched to multi-field `$or` MongoDB `$regex` queries (e.g., matching `name`, `specialization`, or `hospital` case-insensitively using `'i'`).
* **Impact**: Prevented runtime API crashes caused by missing indexes and enabled partial, instant matching on search queries for a better search UX.

### 2. Micro-Optimization with Mongoose `.lean()` for Read-Heavy Queries
* **Context**: Fetching lists of doctors and patients for tabular view requires transferring multiple document instances over the network during every pagination request.
* **Decision**: Added Mongoose `.lean()` chaining to all `GET` API read queries to return plain JavaScript objects instead of full Mongoose Hydrated Documents.
* **Impact**: Significantly reduced memory overhead and CPU processing time on the server, speeding up JSON serialization and improving page load speeds.


## Visual Evidence

### Desktop Preview

#### 1. Admin Dashboard Analytics
<img src="https://github.com/user-attachments/assets/d38c3623-218e-444a-9252-1d1751b2ee29" width="100%" />

#### 2. Analytics Charts & Metrics
<img src="https://github.com/user-attachments/assets/b474906a-7530-4ceb-8cab-0eebc12af02f" width="100%" />

#### 3. Doctors Management Directory
<img src="https://github.com/user-attachments/assets/5b02ab01-cb95-4d04-b710-29b4def0b4a9" width="100%" />

#### 4. Patients Directory & Records
<img src="https://github.com/user-attachments/assets/4da9fc2f-111a-4dc0-8dcd-79845952fb64" width="100%" />



### Mobile Preview

#### 1. Analytics Dashboard
<img src="https://github.com/user-attachments/assets/9002c191-360f-4e72-b8a9-bf069e9ad2c4" width="320" />

#### 2. Analytics Charts & Metrics
<img src="https://github.com/user-attachments/assets/3cc45e9e-bd00-4b92-b1ef-6595b41d419a" width="320" />

#### 3. Patients Management Directory
<img src="https://github.com/user-attachments/assets/4d74d8a7-f68a-4007-ade9-66e40afd2031" width="320" />

#### 4. Sidebar View
<img src="https://github.com/user-attachments/assets/181b37d6-2409-4ee4-b269-50332b8d6299" width="320" />