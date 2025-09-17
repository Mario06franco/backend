// test-connection.js
const mongoose = require('mongoose');
require('dotenv').config();

const testConnection = async () => {
  try {
    console.log('🔗 Conectando a MongoDB local...');
    console.log('📦 URI:', process.env.MONGODB_URI);
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Conexión exitosa a MongoDB local');
    console.log('📊 Base de datos:', mongoose.connection.name);
    
    // Listar todas las bases de datos
    const dbs = await mongoose.connection.db.admin().listDatabases();
    console.log('🗃️ Bases de datos disponibles:');
    dbs.databases.forEach(db => console.log('   -', db.name));
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    process.exit(1);
  }
};

testConnection();