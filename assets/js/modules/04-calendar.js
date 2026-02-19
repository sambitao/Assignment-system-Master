e) charts.jobType.destroy();
            const ctxType = document.getElementById('chartJobType');
            if(ctxType) { charts.jobType = new Chart(ctxType, { type: 'bar', data: { labels: Object.keys(types), datasets: [{ label: 'Count', data: Object.values(types), backgroundColor: '#8b5cf6' }] }, options: { responsive: true, maintainAspectRatio: false } }); }
            const agencies = {}; data.forEach(a => { const g = a.agency || 'Unknown'; agencies[g] = (agencies[g] || 0) + 1; });
            if(charts.agency) charts.agency.destroy();
            const ctxAgency = document.getElementById('chartAgency');
            if(ctxAgency) { charts.agency = new Chart(ctxAgency, { type: 'bar', data: { labels: Object.keys(agencies), datasets: [{ label: 'Count', data: Object.values(agencies), backgroundColor: '#ec4899' }] }, options: { responsive: true, maintainAspectRatio: false } }); }
        };

        window.performSave = function() { if($("#assignment-form").valid()) { saveAssignment(); } };
        
        window.renderDropdowns = function() { 
            const populate = (id, list) => { const el = $(`#${id}`); el.empty().append('<option value="">เลือก...</option>'); if(list) list.forEach(i => el.append(`<option value="${i}">${i}</option>`)); };
            let targetCat = currentCategoryFilter === 'summary_dashboard' ? 'summary_plan' : currentCategoryFilter;
            const config = menuConfig[targetCat] || menuConfig['team'];
            const activeKey = config.jobTypeKey;
            
            populate('form-job-type', CONST_DATA.jobTypes[activeKey]); 
            populate('form-agency', CONST_DATA.agencies); 
            populate('form-project', CONST_DATA.projects); 
            populate('form-team-req', CONST_DATA.teamRequests); 
            populate('form-side-count', CONST_DATA.sideCounts); 
            
            const nsSelect = $('#form-ns-respond'); nsSelect.empty(); const nsList = masterData.nsRespond || masterData.NsRespond || [];
            nsList.forEach(i => nsSelect.append(new Option(i, i, false, false))); nsSelect.trigger('change');
        };

        window.changePage = function(p) {
            if (p < 1) p = 1;
            const totalPages = Math.ceil(filteredData.length / rowsPerPage);
            if (p > totalPages && totalPages > 0) p = totalPages;
            currentPage = p;
            renderTable();
        };

        window.changeRowsPerPage = function() {
            const val = $('#rows-per-page').val();
            rowsPerPage = val === 'all' ? 99999 : parseInt(val);
            currentPage = 1; 
            renderTable();
        };

        window.renderTable = function() { 
            const tbody = document.getElementById("table-body"); if(!tbody) return;
            const sv = $('#search-input').val().toLowerCase(), fs = $('#filter-status').val();
            const th = document.getElementById("table-header-row");
            const config = menuConfig[currentCategoryFilter];
            const thClass = "p-3 text-center align-middle whitespace-normal break-words font-semibold text-gray-700 bg-gray-50 border-b border-gray-200 min-w-[80px]";
            let cols = `<th class="${thClass}">Job ID</th>`;
            
            if (currentCategoryFilter === 'summary_plan') {
                // Custom columns for Summary Plan Job List
                cols += `<th class="${thClass}">Job Type</th><th class="${thClass}">Project Code</th><th class="${thClass}">Route Name</th><th class="${thClass}">Distance</th><th class="${thClass}">Due Date</th><th class="${thClass}">Sym Impact</th><th class="${thClass}">Progress</th><th class="${thClass}">NS</th><th class="${thClass}">Status</th><th class="${thClass}">Action</th>`;
            } else if (config && config.isSub) {
                 cols += `<th class="${thClass}">Job Type</th><th class="${thClass}">Desc</th><th class="${thClass}">Objective</th><th class="${thClass}">Expenses</th><th class="${thClass}">Route Code</th><th class="${thClass}">Action Date</th><th class="${thClass}">Subcontractor</th><th class="${thClass}">NS</th><th class="${thClass}">Location</th><th class="${thClass}">Status</th><th class="${thClass}">Action</th>`;
            } else if (config && config.isPlan) {
                 cols += `<th class="${thClass}">Interruption Type</th><th class="${thClass}">Project</th><th class="${thClass}">Desc</th><th class="${thClass}">Agency</th><th class="${thClass}">Sent Plan Date</th><th class="${thClass}">Action Date</th><th class="${thClass}">Location</th><th class="${thClass}">Status</th><th class="${thClass}">NS</th><th class="${thClass}">Item</th><th class="${thClass}">Action</th>`;
            } else {
                 cols += `<th class="${thClass}">Job Type</th><th class="${thClass}">Desc</th><th class="${thClass}">Action Date</th><th class="${thClass}">Due Date</th><th class="${thClass}">Team</th><th class="${thClass}">NS</th><th class="${thClass}">Location</th><th class="${thClass}">Status</th><th class="${thClass}">Action</th>`;
            }
            $('#table-header').html(`<i class="fa-solid fa-list-ul mr-2 text-brand-500"></i> รายการงาน ${config ? config.title : 'All'}`); th.innerHTML = cols;
            
            filteredData = assignments.filter(a => {
                if (currentCategoryFilter !== 'dashboard_analytics' && currentCategoryFilter !== 'sub_dashboard' && a.category !== currentCategoryFilter) return false;
                if (fs !== 'all' && a.status !== fs) return false;
                const searchFields = [ a.internalId, a.description, a.location, a.jobType, a.agency, a.teamReq, a.subcontractor, a.project, (a.nsRespond || []).join(' ') ];
                return searchFields.join(' ').toLowerCase().includes(sv);
            });
            const total = filteredData.length, start = (currentPage - 1) * rowsPerPage, pageData = filteredData.slice(start, start + rowsPerPage);
            tbody.innerHTML = "";
            if (total === 0) { $('#empty-state').removeClass('hidden'); $('#data-table').addClass('hidden'); }
            else {
                $('#empty-state').addClass('hidden'); $('#data-table').removeClass('hidden');
                pageData.forEach(item => {
                    const badge = `<span class="status-badge status-${item.status}">${item.status.toUpperCase().replace('_', ' ')}</span>`;
                    const sub = config && config.isSub ? (item.subcontractor || '-') : (item.teamReq || '-');
                    const acts = window.getActionButtons(item, config && config.isSub, config && config.isPlan);
                    const nsNames = extractNS(item.nsRespond).names; // Extract NS names for reuse

                    let rowHtml = `<td class="p-3 text-center font-mono font-bold text-brand-600 text-xs" title="${item.internalId}">${item.internalId}</td>`;
                    
                    if (currentCategoryFilter === 'summary_plan') {
                        // Summary Plan Rows
                        const progressVal = item.progressPercent || 0;
                        const progressColor = progressVal === 100 ? 'bg-green-500' : 'bg-yellow-500';
                        const progressHtml = item.status === 'process' 
                            ? `<div class="w-full bg-gray-200 rounded-full h-2.5 mb-1 cursor-pointer" onclick="updateProgressSummary('${item.id}')" title="Click to update"><div class="${progressColor} h-2.5 rounded-full" style="width: ${progressVal}%"></div></div><div class="text-[10px] text-center font-bold text-gray-600 cursor-pointer" onclick="updateProgressSummary('${item.id}')">${progressVal}% <i class="fa-solid fa-pen ml-1 text-gray-400 hover:text-brand-500"></i></div>` 
                            : `<div class="text-center font-bold text-gray-500 text-xs">${progressVal}%</div>`;

                        rowHtml += `<td class="p-3 text-xs" title="${item.jobType||''}">${item.jobType||'-'}</td>
                                    <td class="p-3 text-center text-xs text-blue-500 truncate max-w-[150px] font-bold" title="${item.projectCode||''}">${item.projectCode||'-'}</td>
                                    <td class="p-3 text-xs truncate max-w-[400px]" title="${item.routeName||''}">${item.routeName||'-'}</td>
                                    <td class="p-3 text-center text-xs" title="${item.distance||''}">${item.distance||'-'}</td>
                                    <td class="p-3 text-center text-xs" title="${item.dueDate ? fmtDate(item.dueDate, true) : ''}">${item.dueDate ? fmtDate(item.dueDate, true) : '-'}</td>
                                    <td class="p-3 text-center text-xs text-orange-600 font-medium" title="${item.symImpact||''}">${item.symImpact||'-'}</td>
                                    <td class="p-3 w-24 align-middle">${progressHtml}</td>
                                    <td class="p-3 truncate max-w-[100px] text-xs" title="${nsNames}">${nsNames}</td>
                                    <td class="p-3 text-center">${badge}</td>`;
                    
                    } else if (config && config.isPlan) {
                        rowHtml += `<td class="p-3 text-xs" title="${item.jobType||''}">${item.jobType||'-'}</td><td class="p-3 text-xs" title="${item.project||''}">${item.project||'-'}</td><td class="p-3 truncate max-w-[400px]" title="${item.description||''}">${item.description||'-'}</td><td class="p-3 text-xs" title="${item.agency||''}">${item.agency||'-'}</td><td class="p-3 text-center text-xs" title="${item.sentPlanDate ? fmtDate(item.sentPlanDate, true) : ''}">${item.sentPlanDate ? fmtDate(item.sentPlanDate, true) : '-'}</td>`;
                        const actionTime = (item.planStartTime && item.planEndTime) ? `<br><span class="text-gray-400">${item.planStartTime}-${item.planEndTime}</span>` : '';
                        rowHtml += `<td class="p-3 text-center text-xs" title="${item.planDate ? fmtDate(item.planDate, true) + (item.planStartTime ? ' ' + item.planStartTime + '-' + item.planEndTime : '') : ''}">${item.planDate ? fmtDate(item.planDate, true) + actionTime : '-'}</td><td class="p-3 truncate max-w-[100px] text-xs" title="${item.location||''}">${item.location||'-'}</td><td class="p-3 text-center">${badge}</td><td class="p-3 truncate max-w-[100px] text-xs" title="${nsNames}">${nsNames}</td><td class="p-3 text-center text-xs">${item.itemCount||'0'}</td>`;
                    } else {
                        rowHtml += `<td class="p-3 text-xs" title="${item.jobType||''}">${item.jobType||'-'}</td><td class="p-3 truncate max-w-[400px]" title="${item.description||''}">${item.description||'-'}</td>`;
                        if (config && config.isSub) rowHtml += `<td class="p-3 text-xs truncate max-w-[100px]" title="${item.objective||''}">${item.objective||'-'}</td><td class="p-3 text-xs" title="${item.expenses||''}">${item.expenses||'-'}</td><td class="p-3 text-xs truncate max-w-[100px]" title="${item.routeCode||''}">${item.routeCode||'-'}</td>`;
                        rowHtml += `<td class="p-3 text-center text-xs" title="${fmtDate(item.actionDate)}">${fmtDate(item.actionDate)}</td>`;
                        if(config && !config.isSub) rowHtml += `<td class="p-3 text-center text-xs" title="${item.dueDate ? fmtDate(item.dueDate, true) : ''}">${item.dueDate ? fmtDate(item.dueDate, true) : '-'}</td>`;
                        rowHtml += `<td class="p-3 text-blue-600 font-medium text-xs" title="${sub}">${sub}</td><td class="p-3 truncate max-w-[100px] text-xs" title="${nsNames}">${nsNames}</td>`;
                        if (!(config && config.isPlan)) rowHtml += `<td class="p-3 truncate max-w-[100px] text-xs" title="${item.location||''}">${item.location||'-'}</td>`;
                        rowHtml += `<td class="p-3 text-center">${badge}</td>`;
                    }
                    
                    let m = `<button onclick="viewDetail('${item.id}')" class="text-gray-400 hover:text-green-600 mx-1"><i class="fa-solid fa-file-lines"></i></button>`;
                    if(config && config.isSub) m += `<button onclick="requestApprove('${item.id}')" class="text-gray-400 hover:text-purple-600 mx-1"><i class="fa-solid fa-money-bill-wave"></i></button>`;
                    m += `<button onclick="openModal('${item.id}')" class="text-gray-400 hover:text-blue-600 mx-1"><i class="fa-solid fa-pen-to-square"></i></button><button onclick="deleteAssignment('${item.id}')" class="text-gray-400 hover:text-red-600 mx-1"><i class="fa-solid fa-trash-can"></i></button>`;
                    if(item.fileUrl && !(config && config.isPlan)) m+= `<a href="${item.fileUrl}" target="_blank" class="text-gray-400 hover:text-blue-500 mx-1"><i class="fa-solid fa-cloud-arrow-down"></i></a>`;
                    rowHtml += `<td class="p-3 text-center"><div class="flex items-center justify-center space-x-2"><div class="flex gap-1">${acts}</div><div class="h-4 w-px bg-gray-200"></div><div class="flex">${m}</div></div></td>`;
                    tbody.insertAdjacentHTML('beforeend', `<tr class="hover:bg-gray-50 border-b border-gray-50">${rowHtml}</tr>`);
                });
            }
            $('#pagination-info').text(`Showing ${Math.min(start+1, total)}-${Math.min(start+pageData.length, total)} of ${total}`);
            $('#pagination-controls').html(`<button onclick="changePage(${Math.max(1, currentPage-1)})" class="px-2 border rounded"><</button><button onclick="changePage(${Math.min(Math.ceil(total/rowsPerPage), currentPage+1)})" class="px-2 border rounded">></button>`);
        };

        window.getActionButtons = function(item, isSub, isPlan) {
		
            // FIX: Check item.category for robustness in Calendar view
            if (item.category === 'summary_plan' || currentCategoryFilter === 'summary_plan') {
                if (item.status === 'new') {
                    return `<button onclick="actionReceiveSummary('${item.id}')" class="bg-blue-500 hover:bg-blue-600 text-white px-2 py-0.5 rounded text-[10px] shadow-sm transition">Receive</button>
                            <button onclick="actionCancelSummary('${item.id}')" class="bg-red-500 hover:bg-red-600 text-white px-2 py-0.5 rounded text-[10px] shadow-sm ml-1 transition">Cancel Job</button>`;
                } else if (item.status === 'process') {
                    return `<button onclick="actionCompleteSummary('${item.id}')" class="bg-green-500 hover:bg-green-600 text-white px-2 py-0.5 rounded text-[10px] shadow-sm transition">Complete</button>
                            <button onclick="actionCancelSummary('${item.id}')" class="bg-red-500 hover:bg-red-600 text-white px-2 py-0.5 rounded text-[10px] shadow-sm ml-1 transition">Cancel Job</button>`;
                } else {
                    return '-';
                }
            }
            if (isPlan) {
                const cancelBtn = `<button onclick="actionCancelPlan('${item.id}')" class="bg-red-500 text-white px-2 py-0.5 rounded text-[10px] ml-1">Cancel Job</button>`;
                if (item.status === 'new') return `<button onclick="actionReceivePlan('${item.id}')" class="bg-blue-500 text-white px-2 py-0.5 rounded text-[10px]">Receive</button>${cancelBtn}`;
                if (item.status === 'process') return `<button onclick="actionCompletePlan('${item.id}')" class="bg-green-500 text-white px-2 py-0.5 rounded text-[10px]">Complete</button>${cancelBtn}`;
                
                // Logic: Only 'Interruption OFC' can proceed to Update FMS after Complete
                if (item.status === 'complete') {
                    if (item.jobType === 'Interruption OFC') {
                        return `<button on