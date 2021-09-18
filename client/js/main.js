google.charts.load("current", { packages: ["timeline"] });
google.charts.setOnLoadCallback(Start);

async function Start() {
  const data = await FetchData();
  UpdateGraph(data);
}

async function FetchData() {
  return new Promise(async (resolve, reject) => {
    fetch("/api/users", {
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
  var chart = new google.visualization.Timeline(container);
  var dataTable = new google.visualization.DataTable();
  dataTable.addColumn({ type: "string", id: "User" });
  dataTable.addColumn({ type: "string", id: "Presence" });
  dataTable.addColumn({ type: "date", id: "Start" });
  dataTable.addColumn({ type: "date", id: "End" });

  var startDates = GetScalingDates(CONSTANT.TIMESPAN.HOUR);

  var parsedData = ParseData(data, startDates[0]);
  dataTable.addRows(parsedData);

  // bar colors
  var colors = [];
  var colorMap = {
    Connected: "#57F287", // green
    Muted: "#FEE75C", // yellow
    Deafened: "#ED4245", // red
  };
  for (var i = 0; i < dataTable.getNumberOfRows(); i++) {
    colors.push(colorMap[dataTable.getValue(i, 1)]);
  }

  var options = {
    hAxis: {
      format: "hh:mm",
      minValue: startDates[0],
      maxValue: startDates[1],
    },
    colors: colors,
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
