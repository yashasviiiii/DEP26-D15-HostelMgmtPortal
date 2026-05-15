# HRCRS : Hostel Regulation & Complaints Resolution System

A full-stack portal that digitizes and streamlines hostel operations including room allocation, complaint management, notice distribution, and guest house bookings.

## 🚀 Tech Stack

### Frontend (`/client`)
- **Framework**: Next.js (v16.x) with React (v19)
- **Styling**: Tailwind CSS, PostCSS
- **Animations**: Framer Motion
- **Icons**: Lucide React, Heroicons
- **Features**: Progressive Web App (PWA) supported via `next-pwa`
- **State/Data**: Context API, Axios for API calls, Recharts for dashboard analytics

### Backend (`/server`)
- **Framework**: Node.js with Express.js (v5.x)
- **Database**: MongoDB (via Mongoose v9.x)
- **Authentication**: JWT, Passport.js (Google OAuth2.0), bcrypt
- **File Uploads**: Multer, Cloudinary (via API keys)
- **Email & Notifications**: Nodemailer, Web-Push (for browser push notifications)
- **PDF Generation**: Puppeteer
- **Other Utilities**: Excel parsing (`xlsx`), image processing (`sharp`)

## 🛠️ Prerequisites & Software Requirements

To run this application locally, ensure you have the following installed on your Operating System (Windows, macOS, or Linux):

1. **Node.js**: v18.x or higher (v20+ recommended).
2. **npm**: Node Package Manager (comes with Node.js).
3. **MongoDB**: A running local MongoDB instance or a MongoDB Atlas cluster URI.
4. **Git**: For cloning and version control.
5. **Google Cloud Console Account**: For Google OAuth 2.0 Credentials.
6. **Cloudinary Account**: For managing image uploads (optional, depends on specific module usage).
7. **Email Account**: For sending OTPs and notifications (e.g., a Gmail account with App Passwords enabled).

*Note: The development environment for this specific build was Windows.*

## 📂 Project Structure

```text
dep-hostel-management/
│
├── client/                 # Next.js Frontend Application
│   ├── app/                # Next.js App Router (Dashboard, Login, etc.)
│   ├── components/         # Reusable UI components
│   ├── context/            # React Context (Auth, etc.)
│   ├── lib/                # Utility functions
│   ├── public/             # Static assets and PWA manifest
│   └── package.json        # Frontend dependencies
│
└── server/                 # Express.js Backend Application
    ├── src/
    │   ├── config/         # DB, Passport, and Mail configurations
    │   ├── controllers/    # Request handlers for routes
    │   ├── middleware/     # Auth and Role protection middlewares
    │   ├── models/         # Mongoose Schemas (User, Complaint, Hostel, etc.)
    │   ├── routes/         # Express API routes
    │   └── utils/          # Helper functions (PDF, OTP, Tokens)
    ├── server.js           # Entry point for the backend server
    └── package.json        # Backend dependencies
```

## ⚙️ Environment Variables Setup

You need to create `.env` files in both the `client` and `server` directories.

### Server (`server/.env`)
Create a `.env` file in the `/server` directory with the following variables:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=http://localhost:3000

# Email Configuration (Nodemailer)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Cloudinary (If applicable for uploads)
CLOUD_NAME=your_cloud_name
API_KEY=your_api_key
API_SECRET=your_api_secret
```

### Client (`client/.env.local`)
Create a `.env.local` file in the `/client` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## 🏃‍♂️ Running the Application Locally

### 1. Backend Setup
Open a terminal and navigate to the server directory:
```bash
cd server
npm install
npm start
```
The backend server should now be running on `http://localhost:5000`.

### 2. Frontend Setup
Open a new terminal and navigate to the client directory:
```bash
cd client
npm install
npm run dev
```
The Next.js frontend should now be running on `http://localhost:3000`.

## ✨ Key Features & Modules

- **Role-Based Access Control (RBAC)**: Distinct dashboards and permissions for `admin`, `warden`, `caretaker`, and `student`.
- **Google OAuth Authentication**: Secure login restricted to institutional email domains (e.g., `@iitrpr.ac.in`).
- **Hostel & Room Management**: Admins can configure hostels, set room capacities, and manage staff.
- **Student Allocation**: Batch allocation rules and individual student room assignments.
- **Complaint Management System**:
  - Categorized complaints (Electrical, Plumbing, etc.).
  - Continuous time scheduling for technician visits.
  - Upvoting system for general/community issues.
  - Status tracking and timeline history.
- **Notice Board**: Digital notice distribution with priority flagging and attachments.
- **Guest House Booking**: Form-based request system for institutional guest houses.
- **Push Notifications**: Real-time alerts using Service Workers and Web-Push.
- **Progressive Web App (PWA)**: Installable on mobile and desktop devices for a native app-like experience.

## 📝 Usage Notes

- Ensure that the initial Admin user is either seeded directly into the database or created by temporarily modifying the registration logic, as standard signups default to the `student` role.
- The Google OAuth strategy is currently configured to only allow emails ending with `@iitrpr.ac.in`. Modify `server/src/config/passport.js` if deploying for a different institution.
- PDF generation utilizes `puppeteer`. Ensure your deployment environment supports Chromium or necessary dependencies.
