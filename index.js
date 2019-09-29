function fetch(init_date, date, callback) {
  const fs = require("fs");
  const readline = require("readline");
  const { google } = require("googleapis");
  const date1 = new Date(date);

  console.log("in fetch called function", date1);
  const date2 = new Date(init_date);
  console.log("firstdate", date2);
  var res = {};
  // If modifying these scopes, delete token.json.
  const SCOPES = ["https://www.googleapis.com/auth/calendar"];
  // The file token.json stores the user's access and refresh tokens, and is
  // created automatically when the authorization flow completes for the first
  // time.
  const TOKEN_PATH = "token.json";

  // Load client secrets from a local file.
  fs.readFile("credentials.json", (err, content) => {
    if (err) return console.log("Error loading client secret file:", err);
    // Authorize a client with credentials, then call the Google Calendar API.
    authorize(JSON.parse(content), listEvents);
  });

  /**
   * Create an OAuth2 client with the given credentials, and then execute the
   * given callback function.
   * @param {Object} credentials The authorization client credentials.
   * @param {function} callback The callback to call with the authorized client.
   */
  function authorize(credentials, callback) {
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris[0]
    );

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
      if (err) return getAccessToken(oAuth2Client, callback);
      oAuth2Client.setCredentials(JSON.parse(token));
      console.log("inside authorize");
      callback(oAuth2Client);
      console.log("calling listevents ");
    });
    console.log("revisit authorizenow");
  }

  /**
   * Get and store new token after prompting for user authorization, and then
   * execute the given callback with the authorized OAuth2 client.
   * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
   * @param {getEventsCallback} callback The callback for the authorized client.
   */
  function getAccessToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope: SCOPES
    });
    console.log("Authorize this app by visiting this url:", authUrl);
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    rl.question("Enter the code from that page here: ", code => {
      rl.close();
      oAuth2Client.getToken(code, (err, token) => {
        if (err) return console.error("Error retrieving access token", err);
        oAuth2Client.setCredentials(token);
        // Store the token to disk for later program executions
        fs.writeFile(TOKEN_PATH, JSON.stringify(token), err => {
          if (err) return console.error(err);
          console.log("Token stored to", TOKEN_PATH);
        });
        callback(oAuth2Client);
      });
    });
  }

  /**
   * Lists the next 10 events on the user's primary calendar.
   * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
   */
  function listEvents(auth) {
    console.log("inside listeventsze");
    const calendar = google.calendar({ version: "v3", auth });
    calendar.events.list(
      {
        calendarId: "primary",
        timeMin: date2,
        timeMax: date1,
        maxResults: 100,
        singleEvents: true,
        orderBy: "startTime"
      },
      (err, res) => {
        if (err) return "The API returned an error: " + err;
        const events = res.data.items;
        //var resp = {};
        //console.log(events);
        if (events.length) {
          let resp = {};
          events.map((event, i) => {
            resp["day " + i] = {
              days: event.start.dateTime || event.start.date,
              hasTimeslots: event.start.dateTime ? false : true
            };
          });
          resp = { success: true, days: [{ ...resp }] };
          console.log(resp);
          callback(null, resp);
          console.log("aftercallback");

          //JSON.parse
          //return "success";
          //console.log("Upcoming 10 events in your bookings:");
          /*events.map((event, i) => {
            const start = event.start.dateTime || event.start.date;
            //console.log(`${start} - ${event.summary}`);
          });*/
        } else {
          callback(null, "No upcoming events found.");
          //console.log("No upcoming events found.");
        }
      }
    );
  }
  //return res;
}
module.exports.fet = fetch;
//inserting events