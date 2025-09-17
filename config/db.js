const mongoose = require('mongoose');

// Determinar qué archivo .env cargar según el entorno
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
require('dotenv').config({ path: envFile });

const connectDB = async () => {
  try {
    const options = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    };

    const conn = await mongoose.connect(process.env.MONGODB_URI, options);
    
    const isLocal = conn.connection.host.includes('localhost') || 
                   conn.connection.host.includes('127.0.0.1');
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV}`);
    console.log(`📍 Type: ${isLocal ? 'Local' : 'Atlas (Production)'}`);
    
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.log('📋 URI used:', process.env.MONGODB_URI);
    process.exit(1);
  }
};

module.exports = connectDB;