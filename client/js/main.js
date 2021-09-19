google.charts.load("current", { packages: ["timeline"] });
google.charts.setOnLoadCallback(Refresh);
var timespan = CONSTANT.TIMESPAN.FOURHOURS; // default time period

async function Refresh() {
  const users = await FetchData("/api/users");
  UpdateGraph(users);
  const statistics = await FetchData("/api/statistics");
  UpdateStatistics(statistics);
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
  container.classList.remove("no-data");

  var chart = new google.visualization.Timeline(container);
  var dataTable = new google.visualization.DataTable();

  dataTable.addColumn({ type: "string", id: "User" });
  dataTable.addColumn({ type: "string", id: "Presence" });
  dataTable.addColumn({ type: "string", id: "Style", role: "style" });
  dataTable.addColumn({ type: "date", id: "Start" });
  dataTable.addColumn({ type: "date", id: "End" });

  var startDates = GetScalingDates(timespan);

  // parse data from API and add to table
  var parsedData = ParseData(data, startDates[0]);
  if (!parsedData || !parsedData.length) {
    container.classList.add("no-data");
    container.innerText = "No data was found for this time period.";
    return;
  }
  dataTable.addRows(parsedData);

  // set options
  var options = {
    hAxis: {
      format: "hh:mm",
      minValue: startDates[0],
      maxValue: startDates[1],
    },
    timeline: {
      showBarLabels: false,
      rowLabelStyle: { fontName: "Patua One", fontSize: 24, color: "#000" },
    },
  };

  // make timestamp texts color white
  google.visualization.events.addListener(chart, "ready", function () {
    var labels = container.getElementsByTagName("text");
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

function UpdateStatistics(data) {
  const uptime = document.getElementById("uptime");
  const totalEvents = document.getElementById("total-events");
  uptime.innerText = data.uptime;
  totalEvents.innerText = data.capturedEvents;
}

window.addEventListener("load", () => {
  // add listeners to scaling buttons
  const scalingButtons = document.getElementById("scaling-buttons").children;
  for (let i = 0; i < scalingButtons.length; i++) {
    const button = scalingButtons[i];

    button.addEventListener("click", () => {
      timespan = button.dataset.scale;

      ClearButtonSelection(scalingButtons);
      button.classList.add("selected");

      Refresh();
    });
  }
});

function ClearButtonSelection(buttons) {
  for (let i = 0; i < buttons.length; i++) {
    buttons[i].classList.remove("selected");
  }
}
