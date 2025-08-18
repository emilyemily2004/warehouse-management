const http = require('http');

async function testLogin() {
    const postData = JSON.stringify({
        username: 'admin',
        password: 'admin123'
    });

    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/auth/login',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    const req = http.request(options, (res) => {
        console.log(`Status: ${res.statusCode}`);
        console.log(`Headers: ${JSON.stringify(res.headers)}`);
        
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            console.log('Response body:', data);
            if (res.statusCode === 200) {
                console.log('✅ Login successful!');
            } else {
                console.log('❌ Login failed!');
            }
        });
    });

    req.on('error', (e) => {
        console.error(`❌ Request error: ${e.message}`);
    });

    req.write(postData);
    req.end();
}

testLogin();
