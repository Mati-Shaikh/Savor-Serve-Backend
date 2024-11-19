const twilio = require('twilio');

// Mocking a Twilio service (you should replace with actual Twilio code)
const sendSMS = (phoneNumber, message) => {
  return new Promise((resolve, reject) => {
    // Logic to send SMS
    console.log(`Sending SMS to ${phoneNumber}: ${message}`);
    resolve("SMS sent successfully");
  });
};

module.exports = { sendSMS };
