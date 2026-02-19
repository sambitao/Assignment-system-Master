import { fetchJobs } from "../services/jobService.js";

document.addEventListener("viewChanged", async e => {
  if (e.detail !== "table") return;

  const jobs = await fetchJobs();

  let html = "<table class='w-full border'>";
  html += "<tr class='bg-gray-200'><th>Type</th><th>Status</th></tr>";

  jobs.forEach(j => {
    html += `<tr>
      <td>${j.type || "-"}</td>
      <td>${j.status || "-"}</td>
    </tr>`;
  });

  html += "</table>";

  document.getElementById("view-table").innerHTML = html;
});
