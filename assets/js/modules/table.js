import {
  fetchAssignments,
  deleteAssignment
} from "../services/jobService.js";

async function renderTable() {
  const data = await fetchAssignments();
  const container = document.getElementById("view-table");

  let html = `
    <table class="w-full border">
    <tr class="bg-gray-200">
      <th>Title</th>
      <th>Status</th>
      <th>Date</th>
      <th>Sub</th>
      <th>Action</th>
    </tr>
  `;

  data.forEach(item => {
    html += `
      <tr>
        <td>${item.title || "-"}</td>
        <td>${item.status || "-"}</td>
        <td>${item.date || "-"}</td>
        <td>${item.subcontractor || "-"}</td>
        <td>
          <button data-id="${item.id}" class="deleteBtn text-red-500">
            Delete
          </button>
        </td>
      </tr>
    `;
  });

  html += "</table>";

  container.innerHTML = html;

  document.querySelectorAll(".deleteBtn")
    .forEach(btn => {
      btn.addEventListener("click", async () => {
        await deleteAssignment(btn.dataset.id);
        renderTable();
      });
    });
}

document.addEventListener("viewChanged", e => {
  if (e.detail === "table") renderTable();
});
