
       // === GLOBAL SETUP ===
      const firebaseConfig = {
	apiKey: "AIzaSyBZVvsZcsdrCDYb5JqiZFLaN52hjUi_Arw",
	authDomain: "assignment-interruption-e9481.firebaseapp.com",
	projectId: "assignment-interruption-e9481",
	storageBucket: "assignment-interruption-e9481.firebasestorage.app",
	messagingSenderId: "246855027730",
	appId: "1:246855027730:web:a61bd1dcb9e103c3cc9ccb"
	};
        const appId = 'assignment-app'; 
		
        let auth, db; 
        try { 
            firebase.initializeApp(firebaseConfig); 
            auth = firebase.auth(); 
            db = firebase.firestore(); 
        } catch (e) { 
            console.error("Firebase Init Error:", e); 
        }
        
        const GAS_URL = "https://script.google.com/macros/s/AKfycbw4q5HFIqlTvrA34NN_P9hEWXdVDpyoFICq1OK1NvMkjjN52TSJk5mLHhugc2wbLcqkxA/exec";
		
        let assignments = [];
        let masterData = {};
        let currentView = 'calendar';
        let currentCategoryFilter = 'all';
        let rrState = { next: null, prev: null };
        let currentPage = 1;
        let rowsPerPage = 10;
        let filteredData = [];
        let charts = {}; // <--- Adding this
        
        // Calendar State
        let currentCalendarDate = new Date();
        let calendarViewMode = 'month'; // 'month', 'week', 'day'
        let currentMonth = new Date().getMonth(); // Legacy support if needed
        let currentYear = new Date().getFullYear(); // Legacy support if needed

        const CONST_DATA = { 
            projects: [ "MEA", "PEA", "NBTC", "Sky Train", "Bangkok Metropolis", "BTS", "MRT", "NT", "Customer", "Department Of Highways", "Department Of Rural Road", "Landlord", "Local Authorty", "Motorway", "State Railway OF Thailand", "Underground", "MOI", "Noah", "DWDM", "OLT and ONU", "Site Relocation", "Fiber Infra Sharing", "Improvement", "Migration","Other" ], 
            agencies: [ "MEA", "PEA", "NBTC", "Sky Train", "NPD", "SQM", "Region", "NOC", "SQI", "ROW", "Landlord", "TPD", "Customer", "Bangkok Metropolis", "BTS", "MRT", "NT", "Motorway", "Department Of Highways", "Department Of Rural Road", "Other" ],
            teamRequests: [ "NOC", "HelpDesk", "TPD", "NPD", "SQM", "SQI", "Sale", "Region BKK", "Cores Network", "Landlord", "SDM", "Region Provincial", "ROW", "Other" ], 
            sideCounts: ["1 ฝั่ง", "2 ฝั่ง"],
            jobTypes: { 
                team: ["Improvement", "Create Route", "Meeting", "Team Daily", "Support", "Other"], 
                plan: ["Interruption OFC", "Interruption Equipment", "Information", "Other"], 
                summary_plan: ["MEA", "PEA","MOI","Sky Trai","Bangkok Metropolis","Department Of Highways","Landlord","Underground","Fiber Infra Sharing", "Other"],
                // แก้ไข: เพิ่ม "Special Job" ในรายการ
                preventive: ["Preventive มัดรวบสาย", "Preventive ย้ายแนวสาย", "Preventive เข้าคอนใหม่", "Preventive ติดสติ๊กเกอร์", "Preventive รื้อถอนสายตาย", "Preventive Stand by", "Preventive ทำความสะอาดSite","Preventive งานร้องเรียน", "Special Job", "Other"], 
                reroute: ["Reroute Project", "Underground", "MOI", "Reconfig for Reroute", "Special Job", "Other"], 
                reconfigure: ["Reconfig high loss", "Reconfig New Route","Cancle OFC","Special Job", "Other"] 
            } 
        };
        const menuConfig = { 'plan_interruption': { title: 'Interruption Plan', isSub: false, isPlan: true, prefix: 'IP', jobTypeKey: 'plan', sheetName: 'Interruption Plan' }, 'summary_plan': { title: 'Project Plan', isSub: false, isPlan: true, prefix: 'Sum', jobTypeKey: 'summary_plan', sheetName: 'Summary Plan' }, 'team': { title: 'Assignment Interruption Team', isSub: false, prefix: 'AI', jobTypeKey: 'team', sheetName: 'Interruption Team' }, 'sub_preventive': { title: 'Assignment Preventive', isSub: true, prefix: 'PVT', jobTypeKey: 'preventive', sheetName: 'Assignment Preventive' }, 'sub_reroute': { title: 'Assignment Reroute', isSub: true, prefix: 'RER', jobTypeKey: 'reroute', sheetName: 'Assignment Reroute' }, 'sub_reconfigure': { title: 'Assignment Reconfigure & Cancel', isSub: true, prefix: 'REF', jobTypeKey: 'reconfigure', sheetName: 'Assignment Reconfigure' }, 'dashboard_analytics': { title: 'Dashboard Analytics', isSub: false, isPlan: false, prefix: 'DB', jobTypeKey: 'team' }, 'sub_dashboard': { title: 'Dashboard Subcontractor', isSub: false, isPlan: false, prefix: 'DBS', jobTypeKey: 'preventive' } };

         function getAssignmentsRef() { return db ? db.collection('assignments') : null; }
        function getSettingsRef() { return db ? db.collection('settings').doc('masterData') : null; }
        
        function fmtDate(s, d) { if(!s) return '-'; let dt; if(s.seconds) dt = new Date(s.seconds*1000); else dt=new Date(s); if(isNaN(dt.getTime())) return '-'; const day=dt.getDate(), m=dt.getMonth()+1, y=dt.getFullYear()+543, h=String(dt.getHours()).padStart(2,'0'), mn=String(dt.getMinutes()).padStart(2,'0'); return d ? `${day}/${m}/${y}` : `${day}/${m}/${y} ${h}:${mn}`; }
        function extractNS(d) { const a=Array.isArray(d)?d:(d?[d]:[]); const names=[], phones=[]; a.forEach(s=>{ if(s.includes(' - ')){ const p=s.split(' - '); names.push(p[0]); phones.push(p[1]); } else { names.push(s); } }); return {names:names.join(', '), phones:phones.join(', ') || '-'}; }
        function extractGPS(g) { const lines = (g||'').split('\n'); return {start: lines[0]||'-', end: lines[1]||'-'}; }

        // === FUNCTION DEFINITIONS ===

        // === CALENDAR FUNCTIONS (REFACTORED) ===
        window.setCalendarView = function(mode) {
            calendarViewMode = mode;
            // Update buttons styling
            ['month', 'week', 'day'].forEach(m => {
                const btn = $(`#btn-view-${m}`);
                if (m === mode) {
                    btn.addClass('bg-white text-brand-600 shadow-sm').removeClass('hover:text-gray-700');
                } else {
                    btn.removeClass('bg-white text-brand-600 shadow-sm').addClass('hover:text-gray-700');
                }
            });
            window.renderCalendar();
        };

        window.changeCalendarPeriod = function(step) {
            if (calendarViewMode === 'month') {
                currentCalendarDate.setMonth(currentCalendarDate.getMonth() + step);
            } else if (calendarViewMode === 'week') {
                currentCalendarDate.setDate(currentCalendarDate.getDate() + (step * 7));
            } else { // day
                currentCalendarDate.setDate(currentCalendarDate.getDate() + step);
            }
            // Sync legacy vars just in case
            currentMonth = currentCalendarDate.getMonth();
            currentYear = currentCalendarDate.getFullYear();
            window.renderCalendar();
        };

        window.jumpToToday = function() {
            currentCalendarDate = new Date();
            currentMonth = currentCalendarDate.getMonth();
            currentYear = currentCalendarDate.getFullYear();
            window.renderCalendar();
        };

        window.renderCalendar = function() {
            const container = document.getElementById("calendar-days");
            const headerRow = document.getElementById("calendar-header-days");
            if (!container) return;
            container.innerHTML = "";

            const year = currentCalendarDate.getFullYear();
            const month = currentCalendarDate.getMonth();
            const thaiMonths = ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"];
            const shortThaiMonths = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];

            // Helper to render jobs
            const getJobsForDate = (dateStr) => {
                const catFilter = $('#calendar-filter-category').val();
                
                return assignments.filter(a => {
                    const isDateMatch = (a.actionDate||'').startsWith(dateStr);
                    const isStatusValid = a.status!=='new' && a.status!=='cancel';
                    const isTypeValid = a.category !== 'summary_plan';
                    
                    if (!isDateMatch || !isStatusValid || !isTypeValid) return false;
                    
                    // Filter by Category
                    if (catFilter && catFilter !== 'all') {
                        return a.category === catFilter;
                    }
                    return true;
                }).sort((a,b) => (a.actionDate||'').localeCompare(b.actionDate||''));
            };

            const createJobHTML = (j, isCompact = true) => {
                let cl = j.status==='process'?'bg-yellow-100 text-yellow-800 border-yellow-200':(j.status==='finish'||j.status==='complete'?'bg-green-100 text-green-800 border-green-200':'bg-gray-100 border-gray-200');
                const time = j.actionDate.split('T')[1].slice(0,5);
                
                if (isCompact) {
                    return `<div class="text-[10px] ${cl} border rounded px-1.5 py-0.5 mb-1 truncate cursor-pointer hover:shadow-md transition" onclick="showJobDetail('${j.id}'); event.stopPropagation();" title="${j.description}">
                        <b>${time}</b> ${j.internalId}
                    </div>`;
                } else {
                    // Detailed card for Week/Day view
                    return `<div class="flex flex-col ${cl} border rounded-lg p-2 mb-2 cursor-pointer hover:shadow-md transition relative group" onclick="showJobDetail('${j.id}'); event.stopPropagation();">
                        <div class="flex justify-between items-center mb-1">
                            <span class="font-bold text-xs bg-white bg-opacity-50 px-1 rounded">${time}</span>
                            <span class="text-[10px] font-mono opacity-70">${j.internalId}</span>
                        </div>
                        <div class="text-xs font-semibold truncate leading-tight">${j.description}</div>
                        <div class="text-[10px] mt-1 opacity-80 truncate"><i class="fa-solid fa-user-tag mr-1"></i>${(j.subcontractor || j.teamReq || '-')}</div>
                        <div class="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition"><i class="fa-solid fa-magnifying-glass-plus text-gray-500"></i></div>
                    </div>`;
                }
            };

            if (calendarViewMode === 'month') {
                // === MONTH VIEW ===
                $('#calendar-month-year').text(`${thaiMonths[month]} ${year + 543}`);
                if(headerRow) headerRow.classList.remove('hidden');
                container.className = "grid grid-cols-7 gap-2 flex-1 overflow-y-auto custom-scrollbar content-start"; // Fixed grid

                const firstDay = new Date(year, month, 1).getDay();
                const daysInMonth = new Date(year, month + 1, 0).getDate();

                for(let i=0; i<firstDay; i++) container.appendChild(document.createElement("div"));
                
                for(let i=1; i<=daysInMonth; i++) {
                    const ds = `${year}-${String(month+1).padStart(2,'0')}-${String(i).padStart(2,'0')}`;
                    const jobs = getJobsForDate(ds);
                    const el = document.createElement("div"); 
                    
                    // Highlight today
                    const today = new Date();
                    const isToday = i === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                    const borderClass = isToday ? "border-brand-500 ring-1 ring-brand-200" : "border-gray-200";
                    const bgClass = isToday ? "bg-brand-50" : "bg-white";

                    el.className = `calendar-day relative min-h-[100px] border rounded-xl p-1 hover:bg-gray-50 overflow-hidden flex flex-col ${borderClass} ${bgClass}`;
                    
                    let h = ''; jobs.forEach(j => h += createJobHTML(j, true));
                    el.innerHTML = `<div class="text-right text-xs font-bold ${isToday ? 'text-brand-600' : 'text-gray-400'} mb-1 mr-1">${i}</div><div class="overflow-y-auto flex-1 custom-scrollbar w-full">${h}</div>`;
                    container.appendChild(el);
                }

            } else if (calendarViewMode === 'week') {
                // === WEEK VIEW ===
                // Calculate start of week (Sunday)
                const startOfWeek = new Date(currentCalendarDate);
                startOfWeek.setDate(currentCalendarDate.getDate() - currentCalendarDate.getDay());
                const endOfWeek = new Date(startOfWeek);
                endOfWeek.setDate(startOfWeek.getDate() + 6);

                const sDay = startOfWeek.getDate(), sMonth = shortThaiMonths[startOfWeek.getMonth()];
                const eDay = endOfWeek.getDate(), eMonth = shortThaiMonths[endOfWeek.getMonth()];
                $('#calendar-month-year').text(`${sDay} ${sMonth} - ${eDay} ${eMonth} ${endOfWeek.getFullYear()+543}`);
                
                if(headerRow) headerRow.classList.remove('hidden');
                container.className = "grid grid-cols-7 gap-2 flex-1 overflow-y-hidden h-full"; // Columns extend full height

                for(let i=0; i<7; i++) {
                    const d = new Date(startOfWeek);
                    d.setDate(startOfWeek.getDate() + i);
                    const ds = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
                    const jobs = getJobsForDate(ds);
                    
                    const isToday = d.toDateString() === new Date().toDateString();
                    const borderClass = isToday ? "border-brand-500 bg-brand-50" : "border-gray-200 bg-white";

                    const el = document.createElement("div");
                    el.className = `flex flex-col h-full border rounded-xl overflow-hidden ${borderClass}`;
                    
                    let h = ''; jobs.forEach(j => h += createJobHTML(j, false)); // Use detailed card
                    
                    el.innerHTML = `
                        <div class="p-2 text-center border-b ${isToday ? 'border-brand-200 bg-brand-100' : 'border-gray-100 bg-gray-50'}">
                            <div class="text-lg font-bold ${isToday ? 'text-brand-700' : 'text-gray-700'}">${d.getDate()}</div>
                        </div>
                        <div class="flex-1 overflow-y-auto p-1 custom-scrollbar space-y-1">
                            ${h}
                        </div>
                    `;
                    container.appendChild(el);
                }

            } else {
                // === DAY VIEW ===
                $('#calendar-month-year').text(`${currentCalendarDate.getDate()} ${thaiMonths[currentCalendarDate.getMonth()]} ${currentCalendarDate.getFullYear()+543}`);
                if(headerRow) headerRow.classList.add('hidden'); // Hide Sun-Sat header
                container.className = "flex flex-col h-full overflow-hidden bg-white border rounded-xl";

                const ds = `${year}-${String(month+1).padStart(2,'0')}-${String(currentCalendarDate.getDate()).padStart(2,'0')}`;
                const jobs = getJobsForDate(ds);

                if (jobs.length === 0) {
                    container.innerHTML = `<div class="flex-1 flex flex-col items-center justify-center text-gray-400">
                        <i class="fa-regular fa-calendar-xmark text-6xl mb-4 text-gray-200"></i>
                        <p>ไม่มีงานในวันนี้</p>
                    <