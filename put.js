function insert(init_date, end_date, callback) {
  const fs = require("fs");
  const readline = require("readline");
  const { google } = require("googleapis");
  var moment = require("moment");
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
    authorize(JSON.parse(content), insertEvents);
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
      callback(oAuth2Client);
    });
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

  function insertEvents(auth) {
    var event = {
      summary: "40 min Time slots",
      description: "book slots 40 min.",
      start: {
        dateTime: init_date
      },
      end: {
        dateTime: end_date
      }
    };
    const calendar = google.calendar({ version: "v3", auth });

    const check = {
      auth: auth,
      resource: {
        timeMin: init_date,
        timeMax: end_date,
        items: [{ id: "primary" }]
      }
    };

    calendar.freebusy.query(check, function(err, response) {
      if (err) {
        console.log("error: " + err);

        return;
      } else {
        // check whether booking exist
        if (response.data.calendars["primary"].busy[0]) {
          callback(null, { success: false, message: "invalid time slot" });
        } else {
          calendar.events.insert(
            {
              auth: auth,
              calendarId: "primary",
              resource: event
            },
            function(err, event) {
              if (err) {
                console.log(
                  "There was an error contacting the Calendar service: " + err
                );
                return;
              }
              /*console.log(
                "Event created: %s",
                "event start time:" + event.start.dateTime
              );*/

              //return;
            }
          );
          callback(null, {
            //event
            success: true,
            startTime: moment.utc(event.start.dateTime).local(),
            endTime: moment.utc(event.end.dateTime).local()
          });
          return;
          return;
        }
      }
    });

    /**/
  }
}
module.exports.insert = insert;
