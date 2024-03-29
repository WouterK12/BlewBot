google.charts.load("current", { packages: ["timeline"] });
google.charts.setOnLoadCallback(Refresh);

// time period
var timespan = localStorage.getItem(CONSTANT.IDENTIFIER.TIMESPAN);
if (!timespan) timespan = CONSTANT.TIMESPAN.HOUR;

// auto update interval
var autoUpdateInterval = localStorage.getItem(CONSTANT.IDENTIFIER.AUTOUPDATE);
if (autoUpdateInterval) StartAutoUpdate();

function StartAutoUpdate() {
  autoUpdateInterval = setInterval(() => {
    Refresh();
  }, CONSTANT.AUTOUPDATEINTERVAL);
}

async function Refresh() {
  var updatedText = document.getElementById("updated");

  try {
    const users = await FetchData("/api/users");

    UpdateGraph(users);
    const statistics = await FetchData("/api/statistics");
    UpdateStatistics(statistics);

    const updatedDate = new Date();
    updatedText.innerText = `Updated: ${updatedDate.toLocaleString()}`;
  } catch (err) {
    updatedText.innerText = `Whoops! Something went wrong!\n(${err})`;
  }
}

async function FetchData(endpoint) {
  return new Promise(async (resolve, reject) => {
    fetch(endpoint, {
      method: "GET",
    })
      .then(async (res) => {
        resolve(await res.json());
      })
      .catch((err) => {
        reject(err);
      });
  });
}

function UpdateGraph(data) {
  var container = document.getElementById("chart");
  container.innerHTML = null;

  var chart = new google.visualization.Timeline(container);
  var dataTable = new google.visualization.DataTable();

  dataTable.addColumn({ type: "string", id: "User" });
  dataTable.addColumn({ type: "string", id: "Presence" });
  dataTable.addColumn({ type: "string", id: "Style", role: "style" });
  dataTable.addColumn({ type: "date", id: "Start" });
  dataTable.addColumn({ type: "date", id: "End" });

  // get begin and end dates that belong to selected time period
  var startDates = GetScalingDates(timespan);

  // parse data from API and add to table
  var parsedData = ParseData(data, startDates[0]);

  // update users list
  UpdateUsers(data, parsedData);

  if (!parsedData || !parsedData.length) {
    container.innerText = "No data was found for this time period.";
    return;
  }
  dataTable.addRows(parsedData);

  // set options
  var options = {
    hAxis: {
      format: "HH:mm",
      minValue: startDates[0],
      maxValue: startDates[1],
    },
    timeline: {
      showBarLabels: false,
      rowLabelStyle: { fontName: "Patua One", fontSize: 18, color: "#000" },
    },
  };

  if (timespan === CONSTANT.TIMESPAN.WEEK || timespan === CONSTANT.TIMESPAN.MONTH) {
    options.hAxis.format = "dd/MM";
  }

  google.visualization.events.addListener(chart, "ready", function () {
    // make timestamp texts color white
    var labels = container.getElementsByTagName("text");
    // hey Luc, dit is regel 100 :D
    Array.prototype.forEach.call(labels, (label) => {
      if (label.getAttribute("text-anchor") === "middle") {
        label.setAttribute("fill", "#ffffff");
        label.setAttribute("font-family", "Open Sans");
        label.setAttribute("font-size", 16);
      }
    });
  });

  // draw chart
  chart.draw(dataTable, options);
}

function UpdateUsers(data, parsedData) {
  const userList = document.getElementById("users");
  userList.innerHTML = null;

  if (!data || !data.length) return;

  // order users by connection status, then name
  data.sort(SortUsersByConnection);

  // for every user
  for (let i = 0; i < data.length; i++) {
    const user = data[i];

    // find most recent parsed event of user
    let latestEvent;
    for (let i = 0; i < parsedData.length; i++) {
      if (parsedData[i][0] === user.name) latestEvent = parsedData[i];
    }

    // create main div
    let newUser = document.createElement("DIV");
    newUser.classList.add("user");

    let profilePicture = document.createElement("IMG");
    profilePicture.classList.add("profile-picture");
    profilePicture.src = user.avatar;
    newUser.appendChild(profilePicture);

    // meta
    let meta = document.createElement("DIV");
    meta.classList.add("meta");
    newUser.appendChild(meta);

    let username = document.createElement("H2");
    username.classList.add("username");
    username.innerText = user.name;
    meta.appendChild(username);

    // connection
    let connection = document.createElement("DIV");
    connection.classList.add("connection");
    meta.appendChild(connection);

    // status
    let status = document.createElement("SPAN");
    status.classList.add("status");

    let connectionString = CONSTANT.PRESENCE.DISCONNECTED;
    if (latestEvent) {
      // compare if date of latest event is close to now (within 5000ms)
      // if so, user is connected
      if (IsClose(latestEvent[4], new Date())) {
        connectionString = CONSTANT.PRESENCE.CONNECTED;
      }
    }
    status.classList.add(connectionString);

    connection.appendChild(status);

    // only show presence when connected
    if (connectionString === CONSTANT.PRESENCE.CONNECTED) {
      // connection time
      let time = document.createElement("SPAN");
      time.classList.add("time");

      // find date when user connected (session)
      let connectionStartTime;
      // first event in array is the oldest, loop through it in reverse (chronological)
      for (let i = user.events.length - 1; i > 0; i--) {
        const event = user.events[i];
        if (event == null) continue;

        if (event.connected) connectionStartTime = event.time;
        if (!event.connected) break;
      }

      if (connectionStartTime) {
        time.innerText = GetDuration(Date.now() - +connectionStartTime); // --------- latestEvent[4] to new Date()????? /// is latestEvent then still necessary?
        connection.appendChild(time);
      }

      // presence icons
      let presence = document.createElement("DIV");
      presence.classList.add("presence");
      meta.appendChild(presence);

      let selfMute = false;
      let selfDeaf = false;
      switch (latestEvent[1]) {
        case CONSTANT.PRESENCE.SELFMUTE:
          selfMute = true;
          break;
        case CONSTANT.PRESENCE.SELFDEAF:
          selfDeaf = true;
          break;
      }

      let mute = document.createElement("DIV");
      mute.classList.add(selfMute || selfDeaf ? "muted" : "unmuted");
      presence.appendChild(mute);

      let deaf = document.createElement("DIV");
      deaf.classList.add(selfDeaf ? "deafened" : "undeafened");
      presence.appendChild(deaf);
    }

    // add user to list
    userList.appendChild(newUser);
  }
}

function UpdateStatistics(data) {
  const uptime = document.getElementById("uptime");
  const totalEvents = document.getElementById("total-events");
  uptime.innerText = data.uptime;
  totalEvents.innerText = data.capturedEvents;
}

// when DOM has loaded
window.addEventListener("load", () => {
  // add listener to auto update check
  const autoUpdateCheck = document.getElementById("auto-update-checkbox");
  // revert settings from localStorage
  SelectCheckbox(autoUpdateCheck);

  autoUpdateCheck.addEventListener("change", (e) => {
    if (autoUpdateCheck.checked) {
      StartAutoUpdate();
      Refresh();
      localStorage.setItem(CONSTANT.IDENTIFIER.AUTOUPDATE, true);
    } else {
      clearInterval(autoUpdateInterval);
      localStorage.removeItem(CONSTANT.IDENTIFIER.AUTOUPDATE);
    }
  });

  // add listeners to scaling buttons
  const scalingButtons = document.getElementById("scaling-buttons").children;
  // revert settings from localStorage
  SelectButton(scalingButtons);

  for (let i = 0; i < scalingButtons.length; i++) {
    const button = scalingButtons[i];

    button.addEventListener("click", () => {
      timespan = button.dataset.scale;
      localStorage.setItem(CONSTANT.IDENTIFIER.TIMESPAN, timespan);

      ClearButtonSelection(scalingButtons);
      button.classList.add("selected");

      Refresh();
    });
  }

  // add listener to logout button
  const logoutButton = document.getElementById("logout-button");
  logoutButton.addEventListener("click", () => {
    Logout();
  });
});

// used when loading page (from localStorage)
function SelectCheckbox(autoUpdateCheck) {
  if (autoUpdateInterval) {
    autoUpdateCheck.checked = true;
  }
}

// used when loading page (from localStorage)
function SelectButton(scalingButtons) {
  ClearButtonSelection(scalingButtons);
  const button = document.getElementById(`button-${timespan}`);
  button.classList.add("selected");
}

// remove selection from all buttons
function ClearButtonSelection(buttons) {
  for (let i = 0; i < buttons.length; i++) {
    buttons[i].classList.remove("selected");
  }
}

function Logout() {
  fetch("/logout", {
    method: "DELETE",
    credentials: "include",
  })
    .then(() => {
      // to index
      window.location.href = window.location;
    })
    .catch((err) => {});
}
