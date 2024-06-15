const functions = require('firebase-functions');
const { google } = require('googleapis');
const { authorize } = require('./authorize');

exports.addEventToCalendar = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.end();
    return;
  }

  const auth = await authorize();
  const calendar = google.calendar({ version: 'v3', auth });

  const event = {
    summary: req.body.summary,
    location: req.body.location,
    description: req.body.description,
    start: {
      dateTime: req.body.start,
      timeZone: 'America/Sao_Paulo',
    },
    end: {
      dateTime: req.body.end,
      timeZone: 'America/Sao_Paulo',
    },
  };

  try {
    const response = await calendar.events.insert({
      calendarId: 'testeunna@gmail.com', // Use o e-mail da conta do calendário compartilhado
      resource: event,
    });
    res.status(200).send(response.data);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});
