var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'thebestridaapp@gmail.com', // Use process.env ?
    pass: 'BestRida1' // // Use process.env ?
  }
});

var mailOptions = function (fromUser, toUser) {
  return {
    from: 'Bestrida <thebestridaapp@gmail.com>', // sender address 
    to: toUser.email,
    subject: 'You\'ve been challenged by ' + fromUser.name + '!', // Subject line 
    text: 'You\'ve been challenged by your friend ' + fromUser.name + ' on Bestrida,\
    which is a Strava-based challenge app that enables you to challenge your friends\
    on runs and bike rides.\n\nDownload the app at www.bestrida.co to get started!\n\n\
    Thanks,\nThe Bestrida Team',
    // html: '<b>Hello world ✔</b>' // html body 
  };
};

transporter.sendMail(mailOptions, function(error, info){
  if(error){
    return console.log(error);
  }
  console.log('Message sent: ' + info.response);
});

module.exports.sendMail = function (fromUser, toUser) {
  // TODO: Configure the email to be sent from the user
  
};