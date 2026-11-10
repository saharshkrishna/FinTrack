//importing modules
const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const connectDB = require('./MongoDb/connect.js');
const cors = require('cors');
// Import all route files
const loanRoutes = require('./routes/loan.routes');
const loanReRoutes = require('./routes/loanRe.routes');
const partyRoutes = require('./routes/party.routes');
const paymentModeRoutes = require('./routes/payment.routes');
const transactionRoutes = require('./routes/transaction.routes');
const categoryRoutes = require('./routes/category.routes');
const authRoutes = require('./routes/auth.routes');
const fileRoutes = require('./routes/file.routes');
const businessRoutes = require('./routes/business.routes');
//compiling .env file
dotenv.config();
// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
try {
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
        console.log('Uploads directory created successfully');
    }
} catch (error) {
    console.error('Error creating uploads directory:', error.message);
    console.error('Please ensure the application has write permissions');
    process.exit(1);
}
//Environment variable validation
const requiredEnvVars = ['PORT', 'MONGODB_URL'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingEnvVars.length > 0) {
    console.error(`Error: Missing required environment variables: ${missingEnvVars.join(', ')}`);
    console.error('Please ensure all required environment variables are set in your .env file');
    process.exit(1);
}
//taking the values from .env file
const PORT = process.env.PORT;
const MONGODB_URL = process.env.MONGODB_URL;
//creating the server from express library
const app = express();
//encoding the url to make the data passed through it to a object 
app.use(cors({
    origin: true,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'x-business-id'],
    exposedHeaders: ['x-business-id']
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const businessMiddleware = require('./middleware/business');

// Health check endpoint for connection probing
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

// Mount all route files with their respective API paths
app.use('/api/user/transactions', businessMiddleware, transactionRoutes);
app.use('/api/user/loans', businessMiddleware, loanRoutes);
app.use('/api/user/loanRe', businessMiddleware, loanReRoutes);
app.use('/api/user/parties', businessMiddleware, partyRoutes);
app.use('/api/user/paymentMode', businessMiddleware, paymentModeRoutes);
app.use('/api/user/category', businessMiddleware, categoryRoutes);
app.use('/api/user/uploads', fileRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/user/business', businessRoutes);
app.use('/api/auth', authRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Global 404 handler for unknown routes
app.use((req, res, next) => {
    res.status(404).json({ error: `Cannot ${req.method} ${req.originalUrl}`, statusCode: 404 });
});

// Global centralized Express error-handling middleware
app.use((err, req, res, next) => {
    console.error(`[API Error] ${req.method} ${req.originalUrl}:`, err.stack || err.message || err);
    const statusCode = err.statusCode || err.status || 500;
    res.status(statusCode).json({
        error: err.message || 'Internal Server Error',
        statusCode
    });
});

// Process-level crash prevention guards
process.on('unhandledRejection', (reason, promise) => {
    console.warn('[Process Warning] Unhandled Rejection at:', promise, 'reason:', reason?.message || reason);
});

process.on('uncaughtException', (err) => {
    console.error('[Process Error] Uncaught Exception:', err.message, err.stack);
});
//function to start the server with async/await and robust retry error handling
const StartServer = async (MONGODB_URL) => {
    // Start listening immediately so health checks and loaders can probe connectivity
    const server = app.listen(PORT, () => {
        console.log(`Server started successfully on port ${PORT}`);
    });

    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.error(`[Server Error] Port ${PORT} is already in use. Retrying or awaiting port release...`);
        } else {
            console.error('[Server Error]', err.message);
        }
    });

    const connectWithRetry = async (attempt = 1) => {
        try {
            await connectDB(MONGODB_URL);
        } catch (error) {
            console.warn(`[DB Warning] Connection attempt #${attempt} failed: ${error.message}. Retrying in 3s...`);
            setTimeout(() => connectWithRetry(attempt + 1), 3000);
        }
    };

    connectWithRetry();
};
StartServer(MONGODB_URL);
