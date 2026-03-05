const fs = require('fs');
const http = require('http');

const data = JSON.parse(fs.readFileSync('history/eee/1718020000000.json', 'utf8'));
const postData = JSON.stringify({ code: data.renderCode });

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/render',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
    }
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    res.setEncoding('utf8');
    let responseBody = '';
    res.on('data', (chunk) => {
        responseBody += chunk;
    });
    res.on('end', () => {
        console.log(`BODY: ${responseBody}`);
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.write(postData);
req.end();
