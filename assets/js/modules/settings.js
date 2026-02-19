document.addEventListener("viewChanged", e => {
  if (e.detail !== "settings") return;

  document.getElementById("view-settings")
    .innerHTML = "<h2 class='text-xl font-bold'>Settings Ready</h2>";
});
