# Data Visualization Dashboard

A comprehensive data visualization dashboard built with the MERN stack (MongoDB, Express.js, React, Node.js). This application features authentication, interactive charts, and data filtering capabilities.

## Live Links

- **Frontend Application**: https://frontend-topaz-tau-47.vercel.app
- **Backend API**: https://backend-red-xi.vercel.app

## Features

- **Authentication**: Secure login and registration using JWT (JSON Web Tokens).
- **Interactive Dashboard**: Visualizes data using Recharts (Line charts, Bar charts, Pie charts, etc.).
- **Data Filtering**: Filter data by End Year, Topic, Sector, Region, PESTLE, Source, SWOT, and Country.
- **Responsive Design**: Fully responsive layout including a sidebar and dynamic grid system.
- **Modern UI**: Clean and professional interface inspired by Vuexy design system.

## Tech Stack

### Frontend
- React.js
- Vite
- Recharts (Visualization)
- Lucide React (Icons)
- CSS3 (Custom styling)

### Backend
- Node.js
- Express.js
- MongoDB (Atlas)
- Mongoose
- JSON Web Token (Authentication)

## Local Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/mukulkatewa/dataVisualizationDashboard.git
   cd dataVisualizationDashboard
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   # Create .env file with PORT, MONGO_URI, and JWT_SECRET
   npm start
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Access Application**
   Open http://localhost:5173 to view the dashboard.

## API Endpoints

- **GET /api/insights**: Retrieve filtered data.
- **GET /api/insights/stats**: Get statistical summary.
- **POST /api/auth/login**: User login.
- **POST /api/auth/register**: User registration.

## Deployment

The project is deployed on Vercel.
- Backend is deployed as a serverless function.
- Frontend is deployed as a static site acting as the main entry point.

## License

This project is open source and available under the MIT License.
