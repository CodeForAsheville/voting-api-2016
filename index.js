var express = require('express');
var app = express();
var pg = require('pg');
var fs = require('fs');
var pg = require('pg');
var Pool = pg.Pool;

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index');
});

var dbConfig = {
  host: 'ec2-54-235-90-96.compute-1.amazonaws.com',
  user: 'acrrlrpebgyxur',
  password: 'PhiuOKGIS1XmEGhauBpvzlReob',
  database: 'd59h8c5tcnbcbl',
  ssl: true
};

var pool = new Pool(dbConfig);

app.get('/api', function (request, response) {
  var query = `SELECT * FROM voters WHERE `;
  var useAnd = false;
  if (!(request.query.fname || request.query.lname)) {
    throw 'You must specify at least one of fname, lname.';
  }
  if (request.query.fname) {
    query += 'first_name ilike \'' + request.query.fname + '\'';
    useAnd = true;
  }
  if (request.query.lname) {
    query +=  ((useAnd)?' AND ':'') + ' last_name ilike \'' + request.query.lname + '\'';
  }
  query += ' LIMIT 1000;';
  var voters = pool.query(query)
  .then( (result) => {
    var rows = result.rows;
    if (request.query.age) {
      var age = parseInt(request.query.age, 10)
      rows = result.rows.filter( (item) => {
        return (age == parseInt(item.birth_age));
      });
    }
    response.setHeader('Content-Type', 'application/json');
    response.send(JSON.stringify(rows));
  })
  .catch((err) => {
    if (err) {
      console.log("Got an error: " + JSON.stringify(err));
      response.setHeader('Content-Type', 'application/json');
      response.send(JSON.stringify(err));
    }
  });

});

// var Client = pg.Client;
//
// var client = new Client(process.env.DATABASE_URL);
// client.connect();
//
// app.get('/db', function (request, response) {
//
//   client.query('SELECT * from test_table', function(err, res) {
//     if (err) console.log("Error: " + JSON.stringify(err));
//     console.log('This is it ' + res.rows[0].id + ":  " + res.rows[0].name);
//     client.end();
//   });
// });

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
