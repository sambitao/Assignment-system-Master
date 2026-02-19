import { addJob } from "../services/jobService.js";

export function showAddModal() {
  const modal = document.createElement("div");
  modal.className = "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center";

  modal.innerHTML = `
    <div class="bg-white p-6 rounded w-96 space-y-3">
      <h2 class="text-lg font-bold">Add Job</h2>
      <input id="title" placeholder="Title" class="border p-2 w-full"/>
      <input id="date" type="date" class="border p-2 w-full"/>
      <select id="status" class="border p-2 w-full">
        <option>Pending</option>
        <option>In Progress</option>
        <option>Completed</option>
      </select>
      <button id="saveJob" class="bg-blue-500 text-white px-3 py-1 rounded">Save</button>
      <button id="closeModal" class="text-red-500">Cancel</button>
    </div>
  `;

  document.body.appendChild(modal);

  modal.querySelector("#closeModal")
    .addEventListener("click", () => modal.remove());

  modal.querySelector("#saveJob")
    .addEventListener("click", async () => {
      await addJob({
        title: modal.querySelector("#title").value,
        date: modal.querySelector("#date").value,
        status: modal.querySelector("#status").value,
        subcontractor: ""
      });

      modal.remove();
      document.dispatchEvent(new Event("dataChanged"));
    });
}
