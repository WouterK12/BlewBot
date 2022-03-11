// constants
const CONSTANT = {
  PRESENCE: {
    DISCONNECTED: "Disconnected",
    CONNECTED: "Connected",
    SELFMUTE: "Muted",
    SELFDEAF: "Deafened",
    STREAMING: "Streaming",
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
    PURPLE: "#593695",
  },
  IDENTIFIER: {
    TIMESPAN: "timespan-key",
    AUTOUPDATE: "auto-update-key",
  },
  AUTOUPDATEINTERVAL: 5000,
};

// returns selected timespan [prevDate, now]
function GetScalingDates(timespan) {
  var prevDate = new Date();

  switch (timespan) {
    case CONSTANT.TIMESPAN.HOUR:
      prevDate.setHours(prevDate.getHours() - 1);
      // prevDate.setMinutes(prevDate.getMinutes() - 2); // for testing
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

// check if two dates are close to eachother (within 5000ms)
function IsClose(date1, date2) {
  const timeThreshold = 1e3 * 5;
  date1 = Math.floor(date1.getTime() / timeThreshold);
  date2 = Math.floor(date2.getTime() / timeThreshold);

  if (date1 == date2) return true;
  return false;
}

// sort function to compare users (sort user list)
function SortUsersByConnection(a, b) {
  let ac = a.events[a.events.length - 1];
  let bc = b.events[b.events.length - 1];

  if (ac == null || bc == null) return 0;

  ac = ac.connected;
  bc = bc.connected;

  // sort by connection status
  if (ac !== bc) {
    if (ac === true) return -1;
    if (ac === false) return 0;
  }

  // sort by name
  if (ac === bc) {
    let an = a.name.toLowerCase();
    let bn = b.name.toLowerCase();

    if (an < bn) return -1;
    if (an > bn) return 1;
  }

  return 0;
}

// get active presence from event
function GetPresence(event) {
  let presence = CONSTANT.PRESENCE.DISCONNECTED;

  if (event == null) return presence;

  if (event.connected) {
    presence = CONSTANT.PRESENCE.CONNECTED;
    if (event.streaming) presence = CONSTANT.PRESENCE.STREAMING;
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
    case CONSTANT.PRESENCE.STREAMING:
      return CONSTANT.COLOR.PURPLE;
  }
}

// parse data to be compatible with chart dataset
function ParseData(data, maxPrevDate) {
  let parsedData = [];

  // for every user
  for (let x = 0; x < data.length; x++) {
    const user = data[x];

    // for every event of that user
    for (let y = 0; y < user.events.length; y++) {
      const event = user.events[y];
      if (event == null) continue;

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

      // test if current and next event are not within active timespan (1h, 4h, 1d, 1w, 1m)
      if (GetDate(event.time) <= maxPrevDate) {
        if (GetDate(nextEvent.time) < maxPrevDate) continue;

        // set current event time to be at start of chart (no gaps)
        event.time = maxPrevDate.getTime();
      }

      // create new event
      let newEvent = [user.name, presence, GetColor(presence), GetDate(event.time), GetDate(nextEvent.time)];

      parsedData.push(newEvent);
    }
  }
  return parsedData;
}
