document.addEventListener("viewChanged", e => {
  if (e.detail !== "calendar") return;

  document.getElementById("view-calendar")
    .innerHTML = "<h2 class='text-xl font-bold'>Calendar Ready</h2>";
});
