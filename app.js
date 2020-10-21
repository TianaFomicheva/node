const  express = require('express'),
      app = express(),
      Routes = require('./routes/index'),
      PORT = process.env.PORT || 3000;


app.use(express.static(__dirname + '/public'));
app.use(Routes);


  app.listen(PORT, ()=> console.log('Express started...'));
