const express = require('express');
const app = express();
const path = require('path');
const router = express.Router();




router.get('/',function(req,res){
  res.sendFile(path.join(__dirname+'/static/index.html'));
});
router.get('/login',function(req,res){
  res.sendFile(path.join(__dirname+'/static/login.html'));
});


// Put ROUTES BEING USED IN SERVER


app.use('/', router);
app.use('/login',router)
app.use(express.static(__dirname + '/static'));

app.listen(process.env.port || 3000);

console.log('Running at Port 3000');