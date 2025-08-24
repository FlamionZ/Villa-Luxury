const https = require('http');

async function testEndpoints() {
  console.log('🧪 Testing Villa Paradise API Endpoints...\n');

  const baseUrl = 'http://localhost:3000';
  const endpoints = [
    { path: '/api/gallery', method: 'GET', desc: 'Public Gallery API' },
    { path: '/api/villas', method: 'GET', desc: 'Public Villas API' },
    { path: '/api/admin/auth/check', method: 'GET', desc: 'Admin Auth Check' },
    { path: '/api/admin/gallery', method: 'GET', desc: 'Admin Gallery API' },
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${baseUrl}${endpoint.path}`, {
        method: endpoint.method,
      });

      const status = response.status;
      let icon = '✅';
      
      if (status >= 400) {
        icon = status === 401 ? '🔒' : '❌';
      }

      console.log(`${icon} ${endpoint.desc}: ${status} ${response.statusText}`);
      
      // For successful responses, show data count
      if (status === 200) {
        try {
          const data = await response.json();
          if (data.data && Array.isArray(data.data)) {
            console.log(`   📊 Data items: ${data.data.length}`);
          } else if (data.success !== undefined) {
            console.log(`   ✅ Success: ${data.success}`);
          }
        } catch (e) {
          // Response might not be JSON
        }
      }

    } catch (error) {
      console.log(`❌ ${endpoint.desc}: Connection failed`);
      console.log(`   Error: ${error.message}`);
    }
  }

  console.log('\n🌐 Testing Website Pages...');
  
  const pages = [
    { path: '/', desc: 'Homepage' },
    { path: '/admin/login', desc: 'Admin Login' },
    { path: '/villa/deluxe-mountain-view', desc: 'Villa Detail Page' },
    { path: '/sitemap.xml', desc: 'SEO Sitemap' },
    { path: '/robots.txt', desc: 'SEO Robots' },
  ];

  for (const page of pages) {
    try {
      const response = await fetch(`${baseUrl}${page.path}`);
      const status = response.status;
      const icon = status === 200 ? '✅' : (status === 404 ? '🔍' : '❌');
      
      console.log(`${icon} ${page.desc}: ${status} ${response.statusText}`);
    } catch (error) {
      console.log(`❌ ${page.desc}: Connection failed`);
    }
  }

  console.log('\n🎯 TESTING COMPLETE!');
  console.log('\n📝 Summary:');
  console.log('   ✅ = Working perfectly');
  console.log('   🔒 = Protected (401 expected for admin endpoints)');
  console.log('   🔍 = Not found (may need to be created)');
  console.log('   ❌ = Error (needs attention)');
}

// Only run if server is available
setTimeout(() => {
  testEndpoints().catch(error => {
    console.error('❌ Testing failed:', error.message);
    console.log('\n💡 Make sure the development server is running:');
    console.log('   npm run dev');
  });
}, 2000); // Wait 2 seconds for server to be ready