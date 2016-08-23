var mongoose = require('../db');

var segmentSchema = new mongoose.Schema({
  _id: { type: Number, required: true },
  name: { type: String, required: true },
  activityType: { type: String, required: true },
  distance: { type: Number, required: true },
  averageGrade: {type: Number, required: true },
  climbCategory: {type: Number, required: true },
  city: { type: String },
  state: { type: String },
  country: { type: String },
  totalElevationGain: {type: Number, required: true },
  endLatLng: { type: [mongoose.Schema.Types.Mixed], default: [] },
  startLatLng: { type: [mongoose.Schema.Types.Mixed], default: [] }
}, { timestamps: {} });


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
    climbCategory: climbCategory,
    city: city,
    state: state,
    country: country,
    totalElevationGain: totalElevationGain,
    endLatLng: endLatLng,
    startLatLng: startLatLng
  });
  newSegment.save();
};

module.exports.saveSegment = function (segment) {
  var newSegment = new Segment({
    _id: segment.id,
    name: segment.name,
    activityType: segment.activity_type,
    distance: segment.distance,
    averageGrade: segment.average_grade,
    climbCategory: segment.climb_category,
    city: segment.city,
    state: segment.state,
    country: segment.country,
    totalElevationGain: segment.total_elevation_gain,
    endLatLng: segment.end_latlng,
    startLatLng: segment.start_latlng
  });

  newSegment.update({_id: segment.id }, { upsert: true }, function (err, segment) {
    if (err) {
      console.error('Error saving segment:', err);
    } else {
      console.log('Segment saved!', segment);
    }
  });
};
