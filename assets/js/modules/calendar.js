import { fetchJobs } from "../services/jobService.js";

async function renderCalendar() {
  const jobs = await fetchJobs();
  const container = document.getElementById("view-calendar");

  let html = "<h2 class='text-lg font-bold mb-3'>Calendar</h2>";

  jobs.forEach(j => {
    html += `
      <div class="border p-2 mb-2">
        ${j.date} - ${j.title}
      </div>
    `;
  });

  container.innerHTML = html;
}

document.addEventListener("viewChanged", e => {
  if (e.detail === "calendar") renderCalendar();
});

document.addEventListener("dataChanged", renderCalendar);
