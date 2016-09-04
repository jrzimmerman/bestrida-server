var mongoose = require('../db');

var segmentSchema = new mongoose.Schema({
  _id: { type: Number, required: true },
  resourceState: { type: Number },
  name: { type: String, required: true },
  activityType: { type: String },
  distance: { type: Number },
  averageGrade: {type: Number },
  maximumGrade: {type: Number },
  climbCategory: {type: Number },
  city: { type: String },
  state: { type: String },
  country: { type: String },
  totalElevationGain: {type: Number },
  endLatLng: { type: [mongoose.Schema.Types.Mixed], default: [] },
  startLatLng: { type: [mongoose.Schema.Types.Mixed], default: [] },
  map: { type: Object, default: {} }
}, { timestamps: {} });

var Segment = mongoose.model('Segment', segmentSchema);

module.exports = Segment;

module.exports.saveSegment = function (segment) {
  var newSegment = new Segment({
    _id: segment.id,
    resourceState: segment.resource_state,
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
    startLatLng: segment.start_latlng,
    map: segment.map
  });

  Segment.update({_id: segment.id }, newSegment, { upsert: true }, function (err, segment) {
    if (err) {
      console.error('Error saving segment:' + err);
    } else {
      console.log('Segment saved: ' + segment.name);
    }
  });
};
