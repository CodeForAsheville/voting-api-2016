var express = require('express');
var cors = require('cors');
var app = express().use('*',cors());
//const graphQLServer = express().use('*', cors());
var pg = require('pg');
var fs = require('fs');
var pg = require('pg');
var requestFunc = require('request');
var cheerio = require('cheerio');

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

var voterQuery = function (request, response) {
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
}

var ballotQuery = function (request, response) {

  if (!(request.query.voternum)) {
    response.send('You must specify a voter registration number.');
  }
  var url = 'https://vt.ncsbe.gov/voter_search_public/voter_details.aspx?voter_reg_num=';
  url += request.query.voternum + '&county=11';
  requestFunc(url, function(error, page, html){

        // First we'll check to make sure no errors occurred when making the request

        if(!error){
            // Next, we'll utilize the cheerio library on the returned html which will essentially give us jQuery functionality

            var $ = cheerio.load(html);
            var sballots = $('#sampleballotslist').find('a');
            var result = {
              voter_reg_num: request.query.voternum,
              ballot: 'https://vt.ncsbe.gov/voter_search_public/' + sballots.last('a').attr('href')
            };
            response.setHeader('Content-Type', 'application/json');
            response.send(JSON.stringify(result));
        }
        else {
          response.setHeader('Content-Type', 'application/json');
          response.send('There was an error querying the NC BOE site.');
        }
    })
}

app.get('/api', function (request, response) {
  voterQuery(request, response);
});

app.get('/api/voters', function (request, response) {
  voterQuery(request, response);
});

app.get('/api/ballot', function (request, response) {
  ballotQuery(request, response);
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
