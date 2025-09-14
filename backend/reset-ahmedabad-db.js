const axios = require('axios');

async function resetAndSeedAhmedabadDatabase() {
  try {
    console.log('🗑️  Clearing existing database...');
    
    // Clear the database
    await axios.delete('http://localhost:3001/seed');
    console.log('✅ Database cleared');
    
    // Wait a moment for the clear operation to complete
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('🌱 Seeding database with Ahmedabad routes...');
    
    // Seed the database with Ahmedabad data
    const response = await axios.post('http://localhost:3001/seed');
    
    if (response.status === 201 || response.status === 200) {
      console.log('✅ Ahmedabad database seeded successfully!');
      console.log('📊 Check your database in pgAdmin - you should now see:');
      console.log('   - Ahmedabad Railway Station ↔ Airport routes');
      console.log('   - Gandhinagar ↔ Ahmedabad Central routes');
      console.log('   - Sabarmati Riverfront ↔ Science City routes');
      console.log('   - Real-time GPS data with Ahmedabad coordinates');
    } else {
      console.log('❌ Failed to seed database');
    }
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Backend server is not running. Please start it first with: npm run start:dev');
    } else {
      console.log('❌ Error:', error.message);
    }
  }
}

resetAndSeedAhmedabadDatabase();
