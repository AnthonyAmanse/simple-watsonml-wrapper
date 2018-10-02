const express = require("express");
const app = express();
const mongoose = require("mongoose");
const assert = require("assert");

const watsonMLRoute = require('./routes/watson-ml')

const mongoDbUrl = process.env.MONGODB_URL
const mongoDbOptions = {
  useNewUrlParser: true,
  ssl: true,
  sslValidate: true
};

mongoose.connection.on("error", function(err) {
  console.log("Mongoose default connection error: " + err);
});

mongoose.connection.on("open", function(err) {
  console.log("CONNECTED...");
  assert.equal(null, err);
});

mongoose.connect(mongoDbUrl, mongoDbOptions);

app.use(require("body-parser").json());
app.use('/prediction',watsonMLRoute)

let port = process.env.PORT || 8080;
app.listen(port, function() {
  console.log("To view your app, open this link in your browser: http://localhost:" + port);
});