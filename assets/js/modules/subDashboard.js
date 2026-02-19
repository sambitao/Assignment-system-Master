document.addEventListener("viewChanged", e => {
  if (e.detail !== "sub") return;

  document.getElementById("view-sub")
    .innerHTML = "<h2 class='text-xl font-bold'>Subcontractor Dashboard Ready</h2>";
});
