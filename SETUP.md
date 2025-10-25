# FinTrack Setup Guide

This guide will help you set up and run the FinTrack application locally.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **MongoDB** - [Download here](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) for a cloud database
- **Git** - [Download here](https://git-scm.com/downloads)

## Project Structure

```
FinTrack/
├── Backend/          # Express.js server and API
├── Frontend/         # React frontend application
└── README.md
```

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/saharshkrishna/FinTrack.git
cd FinTrack
```

### 2. Backend Setup

#### Install Dependencies

```bash
cd Backend
npm install
```

#### Configure Environment Variables

Create a `.env` file in the `Backend` directory with the following variables:

```env
# Server Configuration
PORT=5000

# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/fintrack
# For MongoDB Atlas, use:
# MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/fintrack?retryWrites=true&w=majority

# JWT Secret (use a strong, random string)
JWT_SECRET=your_jwt_secret_key_here

# Session Secret
SESSION_SECRET=your_session_secret_here

# CORS Origin (Frontend URL)
CORS_ORIGIN=http://localhost:3000

# Node Environment
NODE_ENV=development
```

**Important Notes:**
- Replace `your_jwt_secret_key_here` with a strong random string (you can generate one using: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
- Replace `your_session_secret_here` with another strong random string
- If using MongoDB Atlas, update `MONGO_URI` with your connection string

#### Start MongoDB (if running locally)

```bash
# On macOS (using Homebrew)
brew services start mongodb-community

# On Linux
sudo systemctl start mongod

# On Windows
net start MongoDB
```

#### Run the Backend Server

```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

The backend server should now be running on `http://localhost:5000`

### 3. Frontend Setup

Open a new terminal window/tab:

#### Install Dependencies

```bash
cd Frontend
npm install
```

#### Configure Environment Variables

Create a `.env` file in the `Frontend` directory based on the provided `.env.example`:

```bash
cp .env.example .env
```

Edit the `.env` file and configure:

```env
# Backend API URL
REACT_APP_API_URL=http://localhost:5000

# Additional configuration (if needed)
REACT_APP_ENV=development
```

**Note:** The `.env.example` file is provided as a template. Make sure to create your own `.env` file with the correct values.

#### Run the Frontend Application

```bash
# Development mode
npm start

# Build for production
npm run build
```

The frontend application should now be running on `http://localhost:3000`

## Database Setup

### Option 1: Local MongoDB

1. Install MongoDB Community Edition
2. Start the MongoDB service
3. The application will automatically create the `fintrack` database and required collections

### Option 2: MongoDB Atlas (Cloud)

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Click "Connect" and choose "Connect your application"
4. Copy the connection string
5. Update the `MONGO_URI` in your Backend `.env` file
6. Make sure to replace `<password>` with your database user password
7. Whitelist your IP address in Atlas Network Access settings

## Verification

### Check Backend

```bash
# Test if backend is running
curl http://localhost:5000

# Or open in browser
http://localhost:5000
```

### Check Frontend

Open your browser and navigate to:
```
http://localhost:3000
```

## Common Issues and Troubleshooting

### Backend won't start

- **MongoDB connection error**: Verify MongoDB is running and connection string is correct
- **Port already in use**: Change the `PORT` in Backend `.env` file
- **Missing dependencies**: Run `npm install` again in the Backend directory

### Frontend won't start

- **Port 3000 already in use**: The application will prompt you to use a different port
- **API connection error**: Verify the `REACT_APP_API_URL` in Frontend `.env` file matches your backend URL
- **Missing dependencies**: Run `npm install` again in the Frontend directory

### Database issues

- **Connection timeout**: Check MongoDB is running and accessible
- **Authentication failed**: Verify your MongoDB credentials in the connection string
- **Network error (Atlas)**: Whitelist your IP address in MongoDB Atlas Network Access

## Development Workflow

1. Start MongoDB (if using local installation)
2. Start the Backend server: `cd Backend && npm run dev`
3. Start the Frontend application: `cd Frontend && npm start`
4. Make changes to the code
5. Both servers support hot-reloading in development mode

## Production Deployment

### Backend

1. Set environment variables on your hosting platform
2. Build and deploy:
   ```bash
   cd Backend
   npm install --production
   npm start
   ```

### Frontend

1. Update `.env` with production API URL
2. Build the application:
   ```bash
   cd Frontend
   npm run build
   ```
3. Deploy the `build` folder to your hosting service (e.g., Netlify, Vercel, AWS S3)

## Additional Notes

- The `.env` files are **NOT** included in the repository for security reasons (they are in `.gitignore`)
- Always use strong, unique secrets for production environments
- Never commit sensitive credentials to version control
- For production, use environment variables provided by your hosting platform
- Make sure to set `NODE_ENV=production` in production environments

## Technologies Used

- **Frontend**: React.js
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)

## Need Help?

If you encounter any issues:

1. Check the console logs for error messages
2. Verify all environment variables are set correctly
3. Ensure all dependencies are installed
4. Check that MongoDB is running and accessible
5. Review the [GitHub Issues](https://github.com/saharshkrishna/FinTrack/issues) page

## Security Reminders

⚠️ **Important Security Notes:**

- Never commit `.env` files to version control
- Use strong, randomly generated secrets for JWT and sessions
- In production, use environment variables from your hosting platform
- Regularly update dependencies to patch security vulnerabilities
- Use HTTPS in production environments
- Implement rate limiting and other security best practices

---

**Happy coding! 🚀**
