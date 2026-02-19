document.addEventListener("viewChanged", e => {
  if (e.detail !== "link") return;

  document.getElementById("view-link")
    .innerHTML = "<h2 class='text-xl font-bold'>Link Support Ready</h2>";
});
