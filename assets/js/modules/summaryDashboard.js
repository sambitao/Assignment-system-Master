document.addEventListener("viewChanged", e => {
  if (e.detail !== "summary") return;

  document.getElementById("view-summary")
    .innerHTML = "<h2 class='text-xl font-bold'>Project Plan Ready</h2>";
});
