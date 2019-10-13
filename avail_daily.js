function find_daily_slots(year, month, day, slot, callback) {
  const auth_fn = require("./auth.js");
  const fs = require("fs");
  const readline = require("readline");
  const { google } = require("googleapis");
  var moment = require("moment");
  var slot_avlbl = [{}];
  const start_time = new Date(year, month - 1, day, 09, 00, 000);
  const end_time = new Date(year, month - 1, day, 17, 00, 000);
  //create slots time for a day
  slot = [
    {
      start: slot[0].start_time,
      end: slot[0].end_time
    },
    {
      start: slot[1].start_time,
      end: slot[1].end_time
    },
    {
      start: slot[2].start_time,
      end: slot[2].end_time
    },
    {
      start: slot[3].start_time,
      end: slot[3].end_time
    },
    {
      start: slot[4].start_time,
      end: slot[4].end_time
    },
    {
      start: slot[5].start_time,
      end: slot[5].end_time
    },
    {
      start: slot[6].start_time,
      end: slot[6].end_time
    },
    {
      start: slot[7].start_time,
      end: slot[7].end_time
    },
    {
      start: slot[8].start_time,
      end: slot[8].end_time
    },
    {
      start: slot[9].start_time,
      end: slot[9].end_time
    },
    {
      start: slot[10].start_time,
      end: slot[10].end_time
    },
    {
      start: slot[11].start_time,
      end: slot[11].end_time
    }
  ];
  var avl_slots = [{}];
  auth_fn.auth(function(err, content) {
    if (err) {
      console.log("error: " + err);
      return;
    }
    const auth = content;
    //console.log(auth);
    query_slots(auth);
  });

  function query_slots(auth) {
    const calendar = google.calendar({ version: "v3", auth });

    const check = {
      auth: auth,
      resource: {
        timeMin: start_time,
        timeMax: end_time,
        items: [{ id: "primary" }]
      }
    };

    calendar.freebusy.query(check, function(err, response) {
      if (err) {
        console.log("error: " + err);

        return;
      } else {
        // separate busy slots from all available slots

        if (
          response.data.calendars["primary"].busy[0] &&
          response.data.calendars["primary"].busy.length != 12
        ) {
          // console.log("bsyslots ", response.data.calendars["primary"].busy[0].start);
          var busy_slots = response.data.calendars["primary"].busy.map(
            (word, i) =>
              (word = moment
                .utc(word.start)
                .local()
                .format("HH:mm"))
          );
          console.log("local busytime", busy_slots);

          var all_slots = slot.map((word, i) => (word = word.start));

          // function to find available slots
          var avlbl_slots = all_slots.filter(x => !busy_slots.includes(x));
          console.log("avlbl_slots", avlbl_slots);
          avlbl_slots1 = avlbl_slots.map(item => {
            const container = {};
            container["startTime"] = moment
              .utc([
                year,
                month - 1,
                day,
                item.substring(0, 2),
                item.substring(3, 5)
              ])
              .local();
            container["endTime"] = moment(container["startTime"]).add(
              40,
              "minutes"
            );

            return container;
          });

          avlbl_slots1 = { suceess: true, timeSlots: [{ ...avlbl_slots1 }] };

          callback(null, avlbl_slots1);
        } else {
          if (response.data.calendars["primary"].busy.length == 12) {
            callback(null, {
              failure: "No Slots available"
            });
          }
          console.log("slots available");
          callback(null, {
            ...slot
          });
          return;
        }
      }
    });

    /**/
  }
}
module.exports.slots = find_daily_slots;
