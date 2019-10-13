//function to get monthly slot details
function fetch(init_date, date, callback) {
  const auth_fn = require("./auth.js");
  const fs = require("fs");
  var _ = require("lodash");
  const { google } = require("googleapis");
  const end_date = new Date(date);
  const start_date = new Date(init_date);
  var res = {};
  auth_fn.auth(function(err, content) {
    if (err) {
      console.log("error: " + err);
      return;
    }
    const auth = content;
    //console.log(auth);
    listEvents(auth);
  });

  function listEvents(auth) {
    //console.log("inside listeventsze");
    const calendar = google.calendar({ version: "v3", auth });
    const check = {
      auth: auth,
      resource: {
        timeMin: start_date,
        timeMax: end_date,
        items: [{ id: "primary" }]
      }
    };
    calendar.freebusy.query(check, function(err, response) {
      if (err) {
        console.log("error: " + err);
        return;
      } else {
        // array to get busy slots in calendar for period
        event = response.data.calendars["primary"].busy;
        // filtering days from the above evnt

        event1 = event.map(x => new Date(x.start).getDate());
        // console.log("event elements", event1);
        var start = start_date.getDate();
        var end = end_date.getDate();
        var day = new Array(end).fill(0);
        //
        //console.log("day arary first day", start + "enddate:" + end);
        // creating a day wise no of events array to check availability is there or not
        for (var i = start; i <= end; i++) {
          for (var x = 0; x < event1.length; x++) {
            if (event1[x] == i) {
              day[i] = day[i] + 1;
            }
          }
        }
        //console.log("bsyaaray", day);
        // for matting out put
        var day1 = [{ success: true, days: [{}] }];
        day.map((x, i) => {
          day1[0]["days"][i] = {
            days: i + 1,
            hasTimeslots: day[i + 1] == 12 ? false : true
          };
        });

        callback(null, day1);
      }
    });
  }
}
module.exports.fet = fetch;
//inserting events
