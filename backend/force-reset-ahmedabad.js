const axios = require('axios');

async function forceResetToAhmedabad() {
  try {
    console.log('🗑️  Force clearing ALL database data...');
    
    // Clear the database completely
    await axios.delete('http://localhost:3001/seed');
    console.log('✅ Database cleared');
    
    // Wait for clear operation to complete
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('🌱 Force seeding database with Ahmedabad routes...');
    
    // Seed the database with Ahmedabad data
    const response = await axios.post('http://localhost:3001/seed');
    
    if (response.status === 201 || response.status === 200) {
      console.log('✅ Ahmedabad database force-seeded successfully!');
      console.log('');
      console.log('📊 Your database now contains:');
      console.log('   🚌 Route 1: Ahmedabad Railway Station ↔ Airport');
      console.log('      Stops: Railway Station → Kalupur → Maninagar → Vastrapur → Bodakdev → Airport');
      console.log('');
      console.log('   🚌 Route 2: Gandhinagar ↔ Ahmedabad Central');
      console.log('      Stops: Gandhinagar → Sector 21 → Infocity → Chandkheda → Naroda → Central');
      console.log('');
      console.log('   🚌 Route 3: Sabarmati Riverfront ↔ Science City');
      console.log('      Stops: Riverfront → Ellis Bridge → Law Garden → Navrangpura → Paldi → Science City');
      console.log('');
      console.log('   📍 GPS Coordinates: All buses now use Ahmedabad coordinates (23.0225°N, 72.5714°E)');
      console.log('');
      console.log('🔍 Check pgAdmin now - you should see the new Ahmedabad routes!');
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

forceResetToAhmedabad();
