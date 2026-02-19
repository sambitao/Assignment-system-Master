import { initRouter } from "./core/router.js";

import "./modules/dashboard.js";
import "./modules/summaryDashboard.js";
import "./modules/subDashboard.js";
import "./modules/calendar.js";
import "./modules/table.js";
import "./modules/linkSupport.js";
import "./modules/settings.js";

document.addEventListener("DOMContentLoaded", () => {
  initRouter();
});
