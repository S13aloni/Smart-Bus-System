const axios = require('axios');

async function manualReset() {
  try {
    console.log('🗑️  Manually clearing database...');
    
    // Clear the database
    const clearResponse = await axios.delete('http://localhost:3001/seed');
    console.log('✅ Database cleared:', clearResponse.data);
    
    // Wait for clear operation to complete
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('🌱 Seeding database with Ahmedabad routes...');
    
    // Seed the database with Ahmedabad data
    const seedResponse = await axios.post('http://localhost:3001/seed');
    console.log('✅ Database seeded:', seedResponse.data);
    
    console.log('');
    console.log('🎉 SUCCESS! Your database now contains Ahmedabad routes:');
    console.log('   🚌 Ahmedabad Railway Station ↔ Airport');
    console.log('   🚌 Gandhinagar ↔ Ahmedabad Central');
    console.log('   🚌 Sabarmati Riverfront ↔ Science City');
    console.log('');
    console.log('🔍 Check pgAdmin now - you should see the new routes!');
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Backend server is not running. Please start it first with: npm run start:dev');
    } else {
      console.log('❌ Error:', error.message);
      if (error.response) {
        console.log('Response:', error.response.data);
      }
    }
  }
}

manualReset();
