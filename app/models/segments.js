var mongoose = require('../db');

var segmentSchema = mongoose.Schema({ 
  _id: { type: Number, required: true },
  name: { type: String, required: true },
  activityType: { type: String, required: true }
});

var Segment = mongoose.model('Segment', segmentSchema);

module.exports = Segment;

module.exports.create = function (segmentId, name, activityType) {
  var newSegment = new Segment({
    _id: segmentId,
    name: name,
    activityType: activityType
  });
  newSegment.save();
};

// If we need findOrCreate method, can use this code but wouldn't have access to mongoose Model methods
// module.exports = {
//   findOrCreate: function (segmentId, segmentName, activityType) {
//     Segment.findOrCreate(
//       {
//         _id: segmentId
//       },
//       {
//         segmentName: segmentName,
//         activityType: activityType
//       },
//       function (err, segment, created) {
//         // 'created' will be true if a new segment was created
//         if (err) {
//           console.error(err);
//         }
//         return segment;
//       }
//     );
//   }
// };