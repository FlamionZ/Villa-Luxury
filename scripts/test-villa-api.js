const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/villas?status=active&limit=10',
  method: 'GET'
};

const req = http.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log('API /api/villas response:');
      console.log('Success:', response.success);
      console.log('Data count:', response.data?.length || 0);
      if (response.data) {
        response.data.forEach((villa, index) => {
          console.log(`${index + 1}. ${villa.title} - Status: ${villa.status}`);
        });
      }
    } catch (e) {
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('Error:', error.message);
});

req.end();