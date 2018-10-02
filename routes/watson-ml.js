const request = require('request');
const express = require('express');
const router = express.Router();

const Predictions = require("../models/predictions");
const RegistereesFunction = require("../models/registeree");

const ML_URL = process.env.ML_URL;
const ML_USERNAME = process.env.ML_USERNAME;
const ML_PASSWORD = process.env.ML_PASSWORD;
const scoring_url = process.env.SCORING_URL;

function getPrediction(url,username,password,scoring_url,payload,callback) {
  // get a token first
  request.get(url + "/v3/identity/token", {
    auth: {
      user: username,
      pass: password,
      sendImmediately: true
    }
  }, function (err, response, body) {
    // call the deployment
    startPrediction(scoring_url,JSON.parse(body).token,payload,callback)
  })
}

function startPrediction(scoring_url, token, payload, callback) {
  request({
    method: 'POST',
    uri: scoring_url,
    json: true,
    auth: {
      bearer: token
    },
    body: payload
  }, function (err, response, body) {
    callback(err, response, body)
  })
}

function getCurrentPrediction(event, callback) {
  Predictions.findOne({"eventId":event}, function (err, event) {
    callback(event)
  })
}

router.get('/:eventId', function(req,res) {
  let Registerees = RegistereesFunction("registerees-" + req.params.eventId)
  Predictions.findOne({'eventId':req.params.eventId}, function (err, doc) {
    if (err) {
      res.send(err);
    } else if (doc) {
      Registerees.countDocuments(function(err, count) {
        if (err) {
          res.send(err);
        }
        else {
          res.send({'prediction': Math.floor(doc.prediction), 'currentParticipants': count});
        }
      });
    } else {
      res.send({"status":"not_found","message":"Event " + req.params.eventId + " not found."});
    }
  })
})

router.post('/new', function(req,res) {
  let eventId = req.body.eventId
  let payload = {"fields": ["Conference", "Location", "Month", "Days", "Attendees"], "values": [[req.body.conference,req.body.location,req.body.month,req.body.days,req.body.attendees]]}

  getPrediction(ML_URL,
    ML_USERNAME,
    ML_PASSWORD,
    scoring_url,
    payload,
    function (err, response, body) {
      console.log(body)
      let prediction = body.values.pop().pop()
      Predictions.findOneAndUpdate({'eventId':eventId},
        {'eventId':eventId, 'prediction': prediction},
        {'upsert': true},
        function (err, doc) {
          if (err) {
            res.send(err);
          } else {
            res.send({"status":"prediction done."});
          }
        })
    })
})

module.exports = router;