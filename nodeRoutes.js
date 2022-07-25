const fs = require('fs');
const express = require('express');
const ejs = require('ejs');
const exphbs = require('express-handlebars');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const ftp = require('ftp-srv');
const path = require('path');
const multer = require('multer');
const { isAsyncFunction } = require('util/types');
const app = express();
var https = require('https');


app.set('view engine', 'ejs')

const port=21;

const ftpServer = new ftp({
    url: "ftp://127.0.0.1:" + port,
    anonymous: true,
    tls: true
});

ftpServer.on('login', (data, resolve, reject) => { 
  if(data.username === 'ruben' && data.password === 'test'){
      return resolve({root: path.join(__dirname+'/')});    
  }
  return reject(new errors.GeneralError('Invalid username or password', 401));
});

try {
  ftpServer.listen().then(() => { 
    console.log('ftp server started');
  });
} catch {
  console.log('ftp server failed');
}

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./server");
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    cb(null, file.originalname);
  },
});

const upload = multer({
  storage: multerStorage
});

const router = express.Router();

// NEED TO PUT USERLIST IN SOME SORT OF .JSON FILE INSTEAD OF HAVING IT HERE
const userList = [{

username: "ruben",
password: "test"

}];

function readFileNames() {

const serverFileNames = [];
let stats;
fs.readdirSync("./server/").forEach(file => {
  stats = fs.statSync('./server/'+file)
  serverFileNames.push({
    fileName: file,
    extension: path.extname(file),
    size: stats.size,
    createdAt: stats.birthtime
  });
  serverFileNames.push(file);
});
console.log(serverFileNames);
return serverFileNames;
}

function authenticateUser(username,password){
  const user = userList.find(u => {return username == u.username && password == u.password});
  
  if (user != null){
    return true;
  
  }
  else{
    return false;
  }

}

router.get('/',function(req,res){
  res.render('pages/index');
});
router.get('/login',function(req,res){
  res.render('pages/login');
});
router.get('/home', function(req,res){
  const serverFileNames = readFileNames();
  res.render('pages/home', {
    files: serverFileNames
  });
});
router.get('/register', function(req,res){
  res.sendFile(path.join(__dirname+'/static/register.html'));
});
router.get('/download', function(req,res){
  res.render('pages/download');
});
router.get('/download/:filename', function(req,res){
  const filename = req.params.filename;
  const file = `${__dirname}/server/${filename}`;
  res.download(file);
});

router.get('/delete/:filename', function(req,res){
  const filename = req.params.filename;
  const file = `${filename}`;
  
  fs.unlink(`${__dirname}/server/${file}`, (err) => {
    if (err) throw err;
    res.redirect('/home');
  });
});

router.get('/upload', function(req,res){
  res.render('pages/upload');
});
router.get('/settings', function(req,res){
  res.render('pages/settings');
});

router.post('/login',function(req,res){
  const {username, password} = req.body;
  userAuth = authenticateUser(username, password);
  if (userAuth == true){
    res.redirect('/home');
  }
  else{
    res.render('pages/login');
  }
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

router.post('/upload',upload.single("singlefile"),async(req,res)=>{
    try{
      if(req.file){
        res.redirect('/home');
      }
      else{
        res.redirect('/upload');
      }


    }
    catch(error){
      res.status(403).json({
        status: "Failure!",
        message: "File was not uploaded",
      });

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

try {
  app.listen(process.env.port || 80);
  console.log('Running http at Port 80');
} catch {
  console.log('http server failed');
}


const credentials = {
  //you need to add your own key and cert here
  key: fs.readFileSync(__dirname+'\\privateKey.key'),
  cert: fs.readFileSync(__dirname+'\\certificate.crt')
};



try {
  https.createServer(credentials, app).listen(443);
  console.log('Running https at Port 443');
} catch {
  console.log('https server failed');
}
