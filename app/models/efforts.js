var mongoose = require('../db');

var effortSchema = mongoose.Schema({ 
  _id: { type: Number, required: true },
  segmentId: { type: Number, required: true },
  stravaId: { type: Number, required: true },
  name: { type: String, required: true },
  elapsedTime: { type: Number, required: true },
});

var Effort = mongoose.model('Effort', effortSchema);

module.exports = Effort;

module.exports.create = function (effortId, segmentId, stravaId, name, elapsedTime) {
  var newEffort = new Effort(
  {
    _id: effortId,
    segmentId: segmentId,
    stravaId: stravaId,
    name: name,
    elapsedTime: elapsedTime
  });
  newEffort.save();
};