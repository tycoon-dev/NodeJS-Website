const ftp = require('ftp-srv');
var https = require('https');
const path = require('path');
const writeLog = require('./nodeRoutes');

const port=21;
const ftpServer = new ftp({
    url: "ftp://127.0.0.1:" + port,
    anonymous: true,
    tls: true,
    greeting: "\n Welcome to ServerX, Please login with your user and password",
    verbose: false
});

ftpServer.on('login', (data, resolve, reject) => { 
  if(data.username === 'ruben' && data.password === 'test'){
      writeLog("login",data.username + "(connection via FTP)");
      return resolve({root: path.join(__dirname+'/server')});    
  }
  return reject(new errors.GeneralError('Invalid username or password', 401));
});


ftpServer.on('disconnect', ({connection, id, newConnectionCount}) => { // TO FIX
    writeLog("logoff",connection.username + "(connection via FTP)");
    return console.log(connection.username + " has disconnected! " + " You now have connected: " + newConnectionCount +" users.\n");

});

try {
  ftpServer.listen().then(() => { 
    console.log('ftp server started');
  });
} catch {
  console.log('ftp server failed');
}

