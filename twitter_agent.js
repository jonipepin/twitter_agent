var twit = require('twit');
var config = require('./config.js');
var fs = require('fs');
var express     = require('express');
var app         = express();

var Twitter = new twit(config);

var tweetArray;
var lastQueryTime = 0;

var saveTweets = function(data) {
  fs.writeFile("./tweets.json", data, function(err) {
      if(err) {
          return console.log(err);
      }
      tweetArray = data;
      console.log("Tweets saved!");
  });
}

var search = function(queryCount=25) {
  var timeElapsed = Date.now() - lastQueryTime;
  console.log('TIme Elapsed: ' + timeElapsed);
  if(timeElapsed < 5000){
    return;
  }

  var params = {
    q: '#androidsummit, @androidsummit',
    result_type: 'recent',
    count: queryCount,
    lang: 'en'
  }

  Twitter.get('search/tweets', params, function(err, data) {
      // if there no errors
        if (!err) {
          //console.log(data);
          saveTweets(data);
          tweetArray = data;
          lastQueryTime = Date.now();
        }
        // if unable to Search a tweet
        else {
          console.log('Something went wrong while SEARCHING...');
        }
    });
}

search();
//setInterval(search, 5000);

app.get('/', (req, res) => res.status(200).send(
  {message: 'This is not the API you\'re looking for'}
));

app.get('/androidsummit/twitter', function(req, res) {

  var token = req.headers['x-api-key'];

  // validate token
  if (token === config.api_token) {
    search();
    res.status(200).json(tweetArray);
  } else {
    // if there is no token
    // return an error
    return res.status(403).send({
        success: false,
        message: 'Are you sure you\'re in the right spot?'
    });
  }

});


app.listen(config.port, function() {
  console.log('Example app listening on port ' + config.port);
});
