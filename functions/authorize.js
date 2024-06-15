const { google } = require('googleapis');
const functions = require('firebase-functions');

const SCOPES = ['https://www.googleapis.com/auth/calendar'];
const CREDENTIALS = require('./serviceAccountKey.json');

const authorize = async () => {
  const { client_email, private_key } = CREDENTIALS;
  const jwtClient = new google.auth.JWT(client_email, null, private_key, SCOPES);

  await jwtClient.authorize();
  return jwtClient;
};

exports.authorize = authorize;
