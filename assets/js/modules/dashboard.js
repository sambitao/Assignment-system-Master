import { fetchJobs } from "../services/jobService.js";

let chart;

document.addEventListener("viewChanged", async e => {
  if (e.detail !== "dashboard") return;

  const container = document.getElementById("view-dashboard");
  container.innerHTML = "<canvas id='chart'></canvas>";

  const jobs = await fetchJobs();

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
});
