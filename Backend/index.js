//importing modules
const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const bodyParser = require('body-parser');
const connectDB = require('./MongoDb/connect.js');
const cors = require('cors');
const userRoutes = require('./routes/user.route')

//compiling .env file
dotenv.config();

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
app.use('/api/user',userRoutes)
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
