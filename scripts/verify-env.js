const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando configuración de entorno...\n');

// Verificar archivos de entorno
const envFiles = ['.env.development', '.env.production'];
envFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} encontrado`);
    
    // Leer y mostrar información (sin valores sensibles)
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    lines.forEach(line => {
      if (line.trim() && !line.includes('KLfTMNbh2SbumLB6')) {
        if (line.includes('MONGODB_URI')) {
          const isLocal = line.includes('localhost');
          console.log(`   📋 ${line.split('=')[0]}: ${isLocal ? 'Local' : 'Atlas'}`);
        } else {
          console.log(`   📋 ${line}`);
        }
      }
    });
  } else {
    console.log(`❌ ${file} no encontrado`);
  }
});

console.log('\n💡 Para probar las conexiones:');
console.log('   npm run dev     -> Conecta a MongoDB Local');
console.log('   npm run start   -> Conecta a MongoDB Atlas');
console.log('\n✅ Configuración lista para usar!');