/**
 * Script de prueba para verificar el API de pending records
 * Ejecutar: node test-api.js
 */

const testAPI = async () => {
  console.log('🧪 Probando API de pending records...\n');

  const testData = {
    clientName: 'Test Cliente',
    appointmentId: 'test-' + Date.now(),
    appointmentDate: new Date().toISOString(),
  };

  console.log('📤 Enviando datos:', testData);
  console.log('🔗 URL: http://localhost:3000/api/pending-records\n');

  try {
    const response = await fetch('http://localhost:3000/api/pending-records', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Success! Status:', response.status);
      console.log('📦 Response:', JSON.stringify(data, null, 2));
      console.log('\n✨ La notificación debería aparecer en http://localhost:3000');
    } else {
      console.log('❌ Error! Status:', response.status);
      console.log('📦 Response:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.log('❌ Error de conexión:', error.message);
    console.log('\n⚠️  Verifica que Fisiodbfiches esté corriendo en http://localhost:3000');
    console.log('   Ejecuta: npm run dev');
  }
};

testAPI();

