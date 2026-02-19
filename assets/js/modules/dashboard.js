import { fetchJobs } from "../services/jobService.js";

let chart;

async function renderDashboard() {
  const jobs = await fetchJobs();
  const container = document.getElementById("view-dashboard");
  container.innerHTML = "<canvas id='chart'></canvas>";

  const count = {};
  jobs.forEach(j => {
    count[j.status] = (count[j.status] || 0) + 1;
  });

  if (chart) chart.destroy();

  chart = new Chart(document.getElementById("chart"), {
    type: "doughnut",
    data: {
      labels: Object.keys(count),
      datasets: [{ data: Object.values(count) }]
    }
  });
}

document.addEventListener("viewChanged", e => {
  if (e.detail === "dashboard") renderDashboard();
});

document.addEventListener("dataChanged", renderDashboard);
