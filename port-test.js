// Port binding test
const net = require('net');

// Test if port 8080 is listening
const client = new net.Socket();

client.setTimeout(5000);

client.connect(8080, 'localhost', function() {
  console.log('✅ Port 8080 is open and listening locally');
  client.destroy();
});

client.on('error', function(err) {
  console.log('❌ Port 8080 is not accessible locally');
  console.log('Error:', err.message);
});

client.on('timeout', function() {
  console.log('❌ Connection to port 8080 timed out');
  client.destroy();
});

// Also test with 127.0.0.1
setTimeout(() => {
  const client2 = new net.Socket();
  client2.setTimeout(5000);
  
  client2.connect(8080, '127.0.0.1', function() {
    console.log('✅ Port 8080 is open and listening on 127.0.0.1');
    client2.destroy();
  });
  
  client2.on('error', function(err) {
    console.log('❌ Port 8080 is not accessible on 127.0.0.1');
    console.log('Error:', err.message);
  });
  
  client2.on('timeout', function() {
    console.log('❌ Connection to port 8080 timed out on 127.0.0.1');
    client2.destroy();
  });
}, 1000);