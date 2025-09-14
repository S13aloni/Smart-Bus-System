const { exec } = require('child_process');
const axios = require('axios');

async function seedDatabase() {
  try {
    console.log('🌱 Seeding database...');
    
    // Make a POST request to the seed endpoint
    const response = await axios.post('http://localhost:3001/seed');
    
    if (response.status === 201 || response.status === 200) {
      console.log('✅ Database seeded successfully!');
      console.log('📊 You can now check your database in pgAdmin');
    } else {
      console.log('❌ Failed to seed database');
    }
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Backend server is not running. Please start it first with: npm run start:dev');
    } else {
      console.log('❌ Error seeding database:', error.message);
    }
  }
}

seedDatabase();
