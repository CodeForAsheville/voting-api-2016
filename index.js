var express = require('express');
var app = express();
var pg = require('pg');

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index');
});
console.log("The DB URL is " + process.env.DATABASE_URL);
var Client = pg.Client;

var client = new Client(process.env.DATABASE_URL);
client.connect();

app.get('/db', function (request, response) {

  client.query('SELECT * from test_table', function(err, res) {
    if (err) console.log("Error: " + JSON.stringify(err));
    console.log(res.rows[0].name);
    client.end();
  });

  pool.query('SELECT * from test_table', null, function(err, result) {
  });
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
