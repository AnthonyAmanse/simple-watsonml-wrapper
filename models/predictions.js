const mongoose = require("mongoose");

// eslint-disable-next-line
let predictionSchema = mongoose.Schema({
  eventId: {type: String, unique: true, index: true},
  prediction: Number
});

module.exports = mongoose.model("Predictions", predictionSchema);