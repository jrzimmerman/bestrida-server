var CronJob = require('cron').CronJob;
var Challenges = require('./models/challenges');

var job = new CronJob({
  cronTime: '0 0 * * * *',
  onTick: function() {
    console.log('starting cron job');
    Challenges.cronComplete();
  },
  start: false,
  runOnInit: true
});

module.exports = {
  job:job
};