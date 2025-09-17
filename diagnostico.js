const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Conectar a la base de datos
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/leclatDB')
  .then(() => {
    console.log('✅ Conectado a MongoDB');
    ejecutarDiagnostico();
  })
  .catch(err => {
    console.error('❌ Error conectando a MongoDB:', err);
  });

async function ejecutarDiagnostico() {
  try {
    const Usuario = require('./models/Usuario');
    
    // 1. Crear un usuario de prueba
    const usuarioPrueba = {
      nombre: 'Usuario Prueba',
      cedula: '1234567890',
      correo: 'prueba@ejemplo.com',
      celular: '3001234567',
      password: 'password123',
      rol: 'cliente'
    };
    
    console.log('🔍 Iniciando diagnóstico...');
    
    // 2. Verificar si el usuario ya existe
    const usuarioExistente = await Usuario.findOne({ 
      $or: [{ correo: usuarioPrueba.correo }, { cedula: usuarioPrueba.cedula }] 
    });
    
    if (usuarioExistente) {
      console.log('⚠️  Usuario ya existe, eliminando...');
      await Usuario.deleteOne({ _id: usuarioExistente._id });
    }
    
    // 3. Crear nuevo usuario
    console.log('👤 Creando usuario de prueba...');
    const nuevoUsuario = new Usuario(usuarioPrueba);
    await nuevoUsuario.save();
    console.log('✅ Usuario creado:', nuevoUsuario.correo);
    
    // 4. Verificar que la contraseña se haya guardado
    console.log('🔐 Contraseña guardada:', nuevoUsuario.password ? nuevoUsuario.password.substring(0, 20) + '...' : 'UNDEFINED!');
    
    if (!nuevoUsuario.password) {
      console.log('❌ ERROR: La contraseña no se guardó correctamente');
      return;
    }
    
    // 5. Verificar contraseña directamente con bcrypt
    console.log('🔐 Verificando contraseña con bcrypt directamente...');
    const esValidaDirecto = await bcrypt.compare('password123', nuevoUsuario.password);
    console.log('✅ Contraseña válida (bcrypt directo):', esValidaDirecto);
    
    // 6. Verificar contraseña usando el método del modelo
    console.log('🔐 Verificando contraseña con método del modelo...');
    const esValidaMetodo = await nuevoUsuario.comparePassword('password123');
    console.log('✅ Contraseña válida (método modelo):', esValidaMetodo);
    
    // 7. Buscar usuario y verificar contraseña
    console.log('🔍 Buscando usuario en BD...');
    const usuarioDesdeBD = await Usuario.findOne({ correo: usuarioPrueba.correo });
    
    if (usuarioDesdeBD) {
      console.log('✅ Usuario encontrado en BD');
      console.log('🔐 Contraseña en BD:', usuarioDesdeBD.password ? usuarioDesdeBD.password.substring(0, 20) + '...' : 'UNDEFINED!');
      
      if (usuarioDesdeBD.password) {
        const esValidaBD = await bcrypt.compare('password123', usuarioDesdeBD.password);
        console.log('✅ Contraseña válida (desde BD):', esValidaBD);
        
        // Mostrar información de la contraseña
        console.log('📊 Información de contraseña:');
        console.log('   - Longitud:', usuarioDesdeBD.password.length);
        console.log('   - Primeros caracteres:', usuarioDesdeBD.password.substring(0, 10) + '...');
        console.log('   - ¿Parece hasheada?', usuarioDesdeBD.password.startsWith('$2b$'));
      } else {
        console.log('❌ ERROR: La contraseña no se recuperó de la BD');
      }
    }
    
    console.log('\n🎉 Diagnóstico completado');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error en diagnóstico:', error);
    process.exit(1);
  }
}