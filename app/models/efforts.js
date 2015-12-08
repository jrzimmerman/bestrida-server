var mongoose = require('../db');

var effortSchema = mongoose.Schema({ 
  effortId: { type: Number, required: true },
  segmentId: { type: Number, required: true },
  stravaId: { type: Number, required: true },
  name: { type: String, required: true },
  elapsedTime: { type: Number, required: true },
});

var Effort = mongoose.model('Effort', effortSchema);

// Helper functions
module.exports = {
  findOrCreate: function (effortId, segmentId, stravaId, name, elapsedTime) {
    Effort.findOrCreate(
      {
        effortId: effortId,
        segmentId: segmentId,
        stravaId: stravaId,
        name: name,
        elapsedTime: elapsedTime
      },
      function (err, effort, created) {
        // 'created' will be true if a new effort was created
        if (err) {
          console.error(err);
        }
        return effort;
      }
    );
  }
};