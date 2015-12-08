var mongoose = require('../db');

var segmentSchema = mongoose.Schema({ 
  _id: { type: Number, required: true },
  name: { type: String, required: true },
  activityType: { type: String, required: true }
});

var Segment = mongoose.model('Segment', segmentSchema);

// Helper functions
module.exports = {
  findOrCreate: function (segmentId, segmentName, activityType) {
    Segment.findOrCreate(
      {
        _id: segmentId
      },
      {
        segmentName: segmentName,
        activityType: activityType
      },
      function (err, segment, created) {
        // 'created' will be true if a new segment was created
        if (err) {
          console.error(err);
        }
        return segment;
      }
    );
  }
};