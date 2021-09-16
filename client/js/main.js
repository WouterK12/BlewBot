window.addEventListener("load", async () => {
  fetch("/api/events").then(
    ((res) => res.json()).then((data) => {
      console.log(data);
    })
  );

  var ctx = document.getElementById("myChart").getContext("2d");
  var myChart = new Chart(ctx, {
    type: "line",
    data: res.data,
    labels: [
      "_id",
      "user",
      "channel",
      "connected",
      "selfMute",
      "selfDeaf",
      "selfVideo",
      "speaking",
      "streaming",
      "time",
      "__v",
    ],
  });
});
