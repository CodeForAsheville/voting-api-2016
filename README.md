# Code for Asheville Voter Information API

A simple API to get voter registration information and links to sample ballots.

## Usage

The URL is has two endpoints, '/api/voters' and '/api/ballot' ('/api' is the same as '/api/voters').

The voters endpoint takes 3 parameters:

    fname – first name
    lname – last name
    age – age of voter

and returns a JSON array of voter registration records. At least one of fname and lname must be specified, while age is optional. For example:

  https://project-url.herokuapp.com/api?lname=jackson&fname=philip&age=54

The ballot endpoint takes a single (required) parameter _voternum_, which is the voter registration number and returns a JSON response with the URL of the voter's sample ballot.

## Installation
This application follows the [_Getting Started_](https://devcenter.heroku.com/articles/getting-started-with-nodejs#introduction) documentation on Heroku. Clone this repository, create a Heroku app, [add a postgres database](https://devcenter.heroku.com/articles/getting-started-with-nodejs#provision-a-database) and push to Heroku (or run locally).

## Loading data into the database
We downloaded the individual county dataset we wanted [here](http://www.ncsbe.gov/other-election-related-data) on the NC Board of Elections site. In our case we downloaded ncvoter11.zip and unzipped to ncvoter11.txt. To load into the database (on OSX):

  cat ncvoter11.txt | iconv -f iso-8859-1 -t utf-8 > ncvoter11.utf
  psql -h {database-host} -d {database-name} -U {database-user} -W -f create_voters_table

If you are re-loading updated data, you'll need to drop the voters table first.
