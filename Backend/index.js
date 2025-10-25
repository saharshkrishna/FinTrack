//importing modules
const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const connectDB = require('./MongoDb/connect.js');
const cors = require('cors');

// Import all route files
const userRoutes = require('./routes/user.route');
const loanRoutes = require('./routes/loan.routes');
const loanReRoutes = require('./routes/loanRe.routes');
const partyRoutes = require('./routes/party.routes');
const paymentModeRoutes = require('./routes/paymentMode.routes');
const transactionRoutes = require('./routes/transaction.routes');

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
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Mount all route files with their respective API paths
app.use('/api/user', userRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/loan-repayments', loanReRoutes);
app.use('/api/parties', partyRoutes);
app.use('/api/payment-modes', paymentModeRoutes);
app.use('/api/transactions', transactionRoutes);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

//function to start the server with async/await and error handling
const StartServer = async (MONGODB_URL) => {
    try {
        //passing mongoDB url to database connecting function
        await connectDB(MONGODB_URL);
        
        //make the server to listen the port  
        app.listen(PORT, () => {
            console.log(`Server started successfully on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error.message);
        console.error('Error details:', error);
        process.exit(1);
    }
};

StartServer(MONGODB_URL);
