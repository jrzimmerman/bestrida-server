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

// If we need findOrCreate method, can use this code but wouldn't have access to mongoose Model methods
// module.exports = {
//   findOrCreate: function (effortId, segmentId, stravaId, name, elapsedTime) {
//     Effort.findOrCreate(
//       {
//         _id: effortId
//       },
//       {
//         segmentId: segmentId,
//         stravaId: stravaId,
//         name: name,
//         elapsedTime: elapsedTime
//       },
//       function (err, effort, created) {
//         // 'created' will be true if a new effort was created
//         if (err) {
//           console.error(err);
//         }
//         return effort;
//       }
//     );
//   }
// };