// importing mongoose module to connect the server to MongoDB database
const mongoose = require('mongoose');

// function to connect to the database with pooling and robust error handling
// Returns a Promise that resolves to the mongoose connection
const connectDB = (url) => {
  // Recommended in Mongoose 7+: strictQuery off by default; explicitly set if needed
  mongoose.set('strictQuery', true);

  const options = {
    // Connection pool settings
    maxPoolSize: 10,           // maximum number of sockets in the pool
    minPoolSize: 2,            // minimum number of sockets to keep open
    serverSelectionTimeoutMS: 10000, // how long to try selecting a server
    socketTimeoutMS: 45000,    // close sockets after inactivity
    // Retry/heartbeat tuning
    heartbeatFrequencyMS: 10000,
    // Parse settings
    // useNewUrlParser and useUnifiedTopology are defaults in modern Mongoose
  };

  // Return the connection promise to allow awaiting in the caller
  return mongoose
    .connect(url, options)
    .then((conn) => {
      const { host, name } = conn.connection;
      console.log(`MongoDB connected: host=${host} db=${name}`);
      // Listen for runtime errors after initial connection
      mongoose.connection.on('error', (err) => {
        console.error('MongoDB runtime error:', err);
      });
      mongoose.connection.on('disconnected', () => {
        console.warn('MongoDB disconnected');
      });
      return conn;
    })
    .catch((err) => {
      // Provide clearer diagnostics and rethrow so callers can handle failure
      console.error('MongoDB connection error:', err?.message || err);
      throw err;
    });
};

module.exports = connectDB;
