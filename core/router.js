export function initRouter() {
  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      switchView(btn.dataset.view);
    });
  });

  switchView("dashboard");
}

function switchView(view) {
  document.querySelectorAll(".view")
    .forEach(v => v.classList.add("hidden"));

  document.getElementById(`view-${view}`)
    .classList.remove("hidden");

  document.dispatchEvent(new CustomEvent("viewChanged", { detail: view }));
}
