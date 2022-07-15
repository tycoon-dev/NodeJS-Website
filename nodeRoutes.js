const fs = require('fs');
const express = require('express');
const exphbs = require('express-handlebars');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const ftp = require('ftp-srv');
const path = require('path');
const app = express();


const port=21;
const ftpServer = new ftp({
    url: "ftp://0.0.0.0:" + port,
    anonymous: true
});

ftpServer.on('login', (data, resolve, reject) => { 
  if(data.username === 'anonymous' && data.password === 'anonymous'){
      return resolve({ root:"/" });    
  }
  return reject(new errors.GeneralError('Invalid username or password', 401));
});

ftpServer.listen().then(() => { 
  console.log('Ftp server is starting...')
});

const router = express.Router();

const userList = [{

username: "ruben",
password: "test"

}];

const serverFileNames = [];

fs.readdirSync("./server/").forEach(file => {
  serverFileNames.push(file);
});

console.log(serverFileNames);

router.get('/',function(req,res){
  res.sendFile(path.join(__dirname+'/static/index.html'));
});
router.get('/login',function(req,res){
  res.sendFile(path.join(__dirname+'/static/login.html'));
});
router.get('/register', function(req,res){
  res.sendFile(path.join(__dirname+'/static/register.html'));
});
router.get('/download', function(req,res){
  res.sendFile(path.join(__dirname+'/static/download.html'));
});
router.get('/upload', function(req,res){
  res.sendFile(path.join(__dirname+'/static/upload.html'));
});
router.get('/settings', function(req,res){
  res.sendFile(path.join(__dirname+'/static/settings.html'));
});

router.post('/login',function(req,res){

const {username, password} = req.body;
const user = userList.find(u => {return username == u.username && password == u.password});
console.log(req.body);

if (user != null){
  res.sendFile(path.join(__dirname+'/static/user.html'));

}
else{
  res.sendFile(path.join(__dirname+'/static/login.html'));
}

});

router.post('/upload',function(req,res){

  const {fileName, file} = req.body;
  


});

router.post('/settings',function(req,res){

  action = req.body.action;
  console.log(req.body.action);
  if(action == "lightMode"){
    res.cookie('background','lightMode');
  }
  if(action == "darkMode"){
    res.cookie('background','lightMode');
  }

});


// Put ROUTES BEING USED IN SERVER

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))
app.use('/', router);
app.use('/login',router)
app.use('/register',router)
app.use('/download',router)
app.use('/upload',router)
app.use('/settings',router)
app.use(express.static(__dirname + '/static'));

app.listen(process.env.port || 3000);

console.log('Running at Port 3000');