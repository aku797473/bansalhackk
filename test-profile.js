const axios = require('axios');

async function test() {
  try {
    const phone = '99999999' + Math.floor(Math.random() * 100);
    const password = 'password123';
    
    console.log(`Registering fake user ${phone}...`);
    const regRes = await axios.post('https://smart-kisan-backend.onrender.com/api/auth/register', {
      phone, password, name: 'Test User'
    });
    
    const token = regRes.data.accessToken;
    console.log('Got token:', token.substring(0, 20) + '...');
    
    console.log('Fetching profile...');
    const profRes = await axios.get('https://smart-kisan-backend.onrender.com/api/users/profile', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('Profile fetch success:', profRes.data);
  } catch (err) {
    if (err.response) {
      console.error('Error Response Data:', JSON.stringify(err.response.data, null, 2));
    } else {
      console.error('Error:', err.message);
    }
  }
}

test();
