// constants
const CONSTANT = {
  PRESENCE: {
    DISCONNECTED: "Disconnected",
    CONNECTED: "Connected",
    SELFMUTE: "Muted",
    SELFDEAF: "Deafened",
  },
  EXCEPTION: ["_id", "user", "channel", "time"],
  TIMESPAN: {
    HOUR: "1h",
    FOURHOURS: "4h",
    DAY: "1d",
    WEEK: "1w",
    MONTH: "1m",
    ALLTIME: "all",
  },
  COLOR: {
    GREEN: "#57F287",
    YELLOW: "#FEE75C",
    RED: "#ED4245",
  },
  IDENTIFIER: "local-key",
};

// returns selected timespan [prevDate, now]
function GetScalingDates(timespan) {
  var prevDate = new Date();

  switch (timespan) {
    case CONSTANT.TIMESPAN.HOUR:
      prevDate.setHours(prevDate.getHours() - 1);
      break;
    case CONSTANT.TIMESPAN.FOURHOURS:
      prevDate.setHours(prevDate.getHours() - 4);
      break;
    case CONSTANT.TIMESPAN.DAY:
      prevDate.setHours(prevDate.getHours() - 24);
      break;
    case CONSTANT.TIMESPAN.WEEK:
      prevDate.setDate(prevDate.getDate() - 7);
      break;
    case CONSTANT.TIMESPAN.MONTH:
      prevDate.setMonth(prevDate.getMonth() - 1);
      break;
    case CONSTANT.TIMESPAN.ALLTIME:
      // not implemented
      break;
  }

  return [prevDate, new Date()];
}

// convert time string to date
function GetDate(timeString) {
  return new Date(+timeString);
}

// convert ms to readable string (hh:mm:ss)
function GetDuration(duration) {
  let seconds = Math.floor((duration / 1000) % 60);
  let minutes = Math.floor((duration / (1000 * 60)) % 60);
  let hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

  hours = hours < 10 ? `0${hours}` : hours;
  minutes = minutes < 10 ? `0${minutes}` : minutes;
  seconds = seconds < 10 ? `0${seconds}` : seconds;

  return `${hours}:${minutes}:${seconds}`;
}

// check if two dates are close to eachother (within 10000ms)
function IsClose(date1, date2) {
  const timeThreshold = 1e4;
  date1 = Math.floor(date1.getTime() / timeThreshold);
  date2 = Math.floor(date2.getTime() / timeThreshold);

  if (date1 == date2) return true;
  return false;
}

// get active presence from event
function GetPresence(event) {
  let presence = CONSTANT.PRESENCE.DISCONNECTED;

  if (event.connected) {
    presence = CONSTANT.PRESENCE.CONNECTED;
    if (event.selfMute) presence = CONSTANT.PRESENCE.SELFMUTE;
    if (event.selfDeaf) presence = CONSTANT.PRESENCE.SELFDEAF;
  }
  return presence;
}

function GetColor(presence) {
  switch (presence) {
    case CONSTANT.PRESENCE.CONNECTED:
      return CONSTANT.COLOR.GREEN;
    case CONSTANT.PRESENCE.SELFMUTE:
      return CONSTANT.COLOR.YELLOW;
    case CONSTANT.PRESENCE.SELFDEAF:
      return CONSTANT.COLOR.RED;
  }
}

// parse data to be compatible with chart dataset
function ParseData(data, maxPrevDate) {
  let parsedData = [];

  // for every user
  for (let x = 0; x < data.length; x++) {
    const user = data[x];

    // test if user was updated within active timespan (1h, 4h, 1d, 1w, 1m, all)
    if (GetDate(user.updatedAt) <= maxPrevDate) continue;

    // for every event of that user
    for (let y = 0; y < user.events.length; y++) {
      const event = user.events[y];

      // test if event has happened within active timespan (1h, 4h, 1d, 1w, 1m, all)
      if (GetDate(event.time) <= maxPrevDate) continue;

      // don't visualize disconnected
      let presence = GetPresence(event);
      if (presence === CONSTANT.PRESENCE.DISCONNECTED) continue;

      // find end time of an event
      let nextEvent;
      if (y + 1 === user.events.length) {
        // if current event is connected, but no next event, stay connected
        if (event.connected) {
          nextEvent = {
            connected: event.connected,
            selfMute: event.selfMute,
            selfDeaf: event.selfDeaf,
            time: new Date().getTime(),
          };
        } else {
          // else user has disconnected at current event
          nextEvent = event;
        }
      } else {
        // else next event exists
        nextEvent = user.events[y + 1];
      }

      // create new event
      let newEvent = [
        user.name,
        presence,
        GetColor(presence),
        GetDate(event.time),
        GetDate(nextEvent.time),
      ];

      parsedData.push(newEvent);
    }
  }
  return parsedData;
}
