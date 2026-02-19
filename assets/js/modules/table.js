import { fetchJobs, removeJob } from "../services/jobService.js";
import { showAddModal } from "./modal.js";

async function renderTable() {
  const jobs = await fetchJobs();
  const container = document.getElementById("view-table");

  let html = `
    <button id="addBtn" class="bg-green-500 text-white px-3 py-1 rounded mb-3">
      Add Job
    </button>
    <table class="w-full border">
    <tr class="bg-gray-200">
      <th>Title</th>
      <th>Status</th>
      <th>Date</th>
      <th>Action</th>
    </tr>
  `;

  jobs.forEach(j => {
    html += `
      <tr>
        <td>${j.title}</td>
        <td>${j.status}</td>
        <td>${j.date}</td>
        <td>
          <button data-id="${j.id}" class="deleteBtn text-red-500">Delete</button>
        </td>
      </tr>
    `;
  });

  html += "</table>";

  container.innerHTML = html;

  document.getElementById("addBtn")
    .addEventListener("click", showAddModal);

  document.querySelectorAll(".deleteBtn")
    .forEach(btn => {
      btn.addEventListener("click", async () => {
        await removeJob(btn.dataset.id);
        renderTable();
        document.dispatchEvent(new Event("dataChanged"));
      });
    });
}

document.addEventListener("viewChanged", e => {
  if (e.detail === "table") renderTable();
});

document.addEventListener("dataChanged", renderTable);
