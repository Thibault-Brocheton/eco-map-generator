const path = require('path')

const express = require('express')

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, './public')));

app.get('/', function(req, res){
  res.sendfile(path.join(__dirname, './public/index.html'));
});

app.listen(port, () => {
  console.log(`MapGenerator listening on port ${port}`)
});