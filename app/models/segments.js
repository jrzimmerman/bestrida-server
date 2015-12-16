var mongoose = require('../db');

var segmentSchema = mongoose.Schema({ 
  _id: { type: Number, required: true },
  name: { type: String, required: true },
  activityType: { type: String, required: true },
  distance: { type: Number, required: true },
  averageGrade: {type: Number, required: true },
  startLatLng: { type: [mongoose.Schema.Types.Mixed], default: [], required: true },
  endLatLng: { type: [mongoose.Schema.Types.Mixed], default: [], required: true },
  climbCategory: {type: Number, required: true },
  city: { type: String },
  state: { type: String },
  country: { type: String },
  totalElevationGain: {type: Number, required: true }
});


var Segment = mongoose.model('Segment', segmentSchema);

module.exports = Segment;

module.exports.create = function (segmentId, name, activityType, distance,
                                  averageGrade, startLatLng, endLatLng, climbCategory,
                                  city, state, country, totalElevationGain) {
  var newSegment = new Segment({
    _id: segmentId,
    name: name,
    activityType: activityType,
    distance: distance,
    averageGrade: averageGrade,
    startLatLng: startLatLng,
    endLatLng: endLatLng,
    climbCategory: climbCategory,
    city: city,
    state: state,
    country: country,
    totalElevationGain: totalElevationGain
  });
  newSegment.save();
};



////////////////////////////////////////////////////
///
////////////////////////////////////////////////////
// module.exports.registerSegment = function (segment, callback) {
//   // Check if segment exists in db
//   Segment.find({ _id: segment.id })
//   .then(function (segmentsArray) {
//     // If segment exists, just refresh token
//     if (segmentsArray[0]){
//       refreshSegment(segment, callback);
//     } else {
//       // Else if segment doesn't exist in db, save them to db
//       saveSegment(segment, callback);
//     }
//   }, function (err) {
//     console.error('Error retrieving segment:', err);
//   });
// };

module.exports.saveSegment = function (segment) {
  var newSegment = new Segment({
    _id: segment.id,
    name: segment.name,
    activityType: segment.activity_type,
    distance: segment.distance,
    averageGrade: segment.average_grade,
    startLatLng: segment.start_latlng,
    endLatLng: segment.end_latlng,
    climbCategory: segment.climb_category,
    city: segment.city,
    state: segment.state,
    country: segment.country,
    totalElevationGain: segment.total_elevation_gain
  });

  newSegment.save(function (err, segment) {
    if (err) {
      console.error('Error saving segment:', err);
    } else {
      console.log('Segment saved!', segment);
    }
  });
};

// function refreshSegment (segment, callback) {
//   Segment.update(
//     { _id: segment.id },
//     {
//       name: segment.name,
//       activityType: segment.activityType,
//       distance: segment.distance,
//       averageGrade: segment.averageGrade,
//       startLatLng: segment.startLatLng,
//       endLatLng: segemnt.endLatLng,
//       climbCategory: segment.climbCategory,
//       city: segment.city,
//       state: segment.state,
//       country: segment.country,
//       totalElevationGain: segment.totalElevationGain
//     },
//     function (err, res) {
//       if (err) {
//         console.error('Error refreshing segment:', err);
//         callback(err);
//       }
//       console.log('Successfully refreshed segment:', res);
//       callback(null, res);
//     });
// }




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