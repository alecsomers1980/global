const https = require('https');
https.get('https://www.mountaincreeklodge.co.za/', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    const matches = data.match(/href=\"([^\"]+)\"/g);
    if(matches) {
      console.log(matches.filter(m => m.toLowerCase().includes('coffee') || m.toLowerCase().includes('litchi')));
    }
  });
}).on('error', (err) => console.log('Error: ' + err.message));
