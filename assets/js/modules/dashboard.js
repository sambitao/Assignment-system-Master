import { fetchAssignments } from "../services/jobService.js";

let chart;

async function renderDashboard() {
  const data = await fetchAssignments();
  const container = document.getElementById("view-dashboard");
  container.innerHTML = "<canvas id='chart'></canvas>";

  const count = {};

  data.forEach(item => {
    const status = item.status || "Unknown";
    count[status] = (count[status] || 0) + 1;
  });

  if (chart) chart.destroy();

  chart = new Chart(document.getElementById("chart"), {
    type: "doughnut",
    data: {
      labels: Object.keys(count),
      datasets: [{
        data: Object.values(count)
      }]
    }
  });
}

document.addEventListener("viewChanged", e => {
  if (e.detail === "dashboard") renderDashboard();
});
