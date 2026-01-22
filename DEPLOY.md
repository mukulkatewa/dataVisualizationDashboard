# Vercel Deployment Guide

Since the Vercel CLI requires authentication, please follow these steps to deploy your application.

## Prerequisites
- Install Vercel CLI globally (optional but recommended): `npm i -g vercel`
- Login to Vercel: `vercel login`

## 1. Deploy Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Run the deployment command:
   ```bash
   vercel
   ```
   - Set up and deploy: **Yes**
   - Scope: **[Select your account]**
   - Link to existing project: **No**
   - Project Name: **blackcoffer-backend** (or your choice)
   - In which directory is your code located: **./**
   - Modify settings: **No**

3. **IMPORTANT**: Copy the **Production** URL from the output (e.g., `https://blackcoffer-backend.vercel.app`).
   *Note: It might be `http` initially, ensure you use `https`.*

4. Add Environment Variables on Vercel Dashboard (Settings -> Environment Variables) for the backend project:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A secret key for authentication
   - *Redeploy if needed for env vars to take effect (`vercel --prod`).*

## 2. Deploy Frontend

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```

2. Run the deployment command with the Backend URL environment variable:
   ```bash
   vercel --env VITE_API_URL=https://YOUR_BACKEND_URL_HERE
   ```
   *Replace `https://YOUR_BACKEND_URL_HERE` with the URL you copied in Step 1 (e.g., `https://blackcoffer-backend.vercel.app`).*

   - Set up and deploy: **Yes**
   - Scope: **[Select your account]**
   - Link to existing project: **No**
   - Project Name: **blackcoffer-frontend**
   - In which directory: **./**
   - Framework Preset: **Vite** (Should be auto-detected)
   - Modify settings: **No**

3. Your dashboard should now be live!
