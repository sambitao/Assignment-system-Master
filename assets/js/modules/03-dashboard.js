   };

        window.renderSummaryDashboard = function() {
            const jobTypeFilter = $('#sum-dash-jobtype').val();
            const dateStart = $('#sum-dash-start').val();
            const dateEnd = $('#sum-dash-end').val();

            // Data source: Only summary_plan category
            let data = assignments.filter(a => a.category === 'summary_plan');

            // Apply Filters
            if(jobTypeFilter !== 'all') {
                data = data.filter(a => a.jobType === jobTypeFilter);
            }
            if(dateStart) {
                // Using dueDate for Summary Plan date filter if available, or createdAt fallback
                data = data.filter(a => {
                    const d = a.dueDate ? new Date(a.dueDate) : (a.actionDate ? new Date(a.actionDate) : null);
                    return d && d >= new Date(dateStart);
                });
            }
            if(dateEnd) {
                data = data.filter(a => {
                    const d = a.dueDate ? new Date(a.dueDate) : (a.actionDate ? new Date(a.actionDate) : null);
                    return d && d <= new Date(dateEnd);
                });
            }

            // Helper to sum distance safely
            const sumDist = (arr) => arr.reduce((acc, curr) => acc + (parseFloat(curr.distance) || 0), 0);

            // --- Calculate Stats ---
            // 1. Amount Route [JobType/All]
            const totalCount = data.length;
            const totalDist = sumDist(data);
            
            $('#sum-stat-route').text(totalCount);
            $('#sum-stat-dist-route').text(totalDist.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}));
            $('#sum-title-route').text(jobTypeFilter !== 'all' ? `Total Plan (${jobTypeFilter})` : 'Total Plan');

            // 2. Amount Route SYMC Impact
            const impactData = data.filter(a => a.symImpact && a.symImpact.trim() !== '' && a.symImpact !== '-');
            const impactCount = impactData.length;
            const impactDist = sumDist(impactData);
            
            $('#sum-stat-impact').text(impactCount);
            $('#sum-stat-dist-impact').text(impactDist.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}));

            // 3. Amount Route SYMC Complete
            const completeData = data.filter(a => a.status === 'complete' || a.status === 'finish');
            const completeCount = completeData.length;
            const completeDist = sumDist(completeData);
            
            $('#sum-stat-complete').text(completeCount);
            $('#sum-stat-dist-complete').text(completeDist.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}));

            // 4. Amount Route SYMC Ongoing
            const ongoingData = data.filter(a => a.status === 'process');
            const ongoingCount = ongoingData.length;
            const ongoingDist = sumDist(ongoingData);
            
            $('#sum-stat-ongoing').text(ongoingCount);
            $('#sum-stat-dist-ongoing').text(ongoingDist.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}));

            // --- Charts ---
            // Chart 1: Job Type Distribution
            const jobTypes = {};
            data.forEach(a => { 
                const t = a.jobType || 'Other';
                jobTypes[t] = (jobTypes[t] || 0) + 1;
            });

            if(charts.sumJobType) charts.sumJobType.destroy();
            const ctx1 = document.getElementById('chartSumJobType');
            if(ctx1) {
                charts.sumJobType = new Chart(ctx1, {
                    type: 'doughnut',
                    data: {
                        labels: Object.keys(jobTypes),
                        datasets: [{
                            data: Object.values(jobTypes),
                            backgroundColor: ['#f97316', '#3b82f6', '#8b5cf6', '#10b981', '#64748b']
                        }]
                    },
                    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }
                });
            }

            // Chart 2: Status Overview
            const statuses = ['new', 'process', 'complete', 'cancel'];
            const statusCounts = statuses.map(s => data.filter(a => a.status === s).length);
            const statusLabels = ['New', 'Ongoing', 'Complete', 'Cancel'];

            if(charts.sumStatus) charts.sumStatus.destroy();
            const ctx2 = document.getElementById('chartSumStatus');
            if(ctx2) {
                charts.sumStatus = new Chart(ctx2, {
                    type: 'bar',
                    data: {
                        labels: statusLabels,
                        datasets: [{
                            label: 'Jobs',
                            data: statusCounts,
                            backgroundColor: ['#3b82f6', '#eab308', '#22c55e', '#ef4444'],
                            barThickness: 40
                        }]
                    },
                    options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } }, plugins: { legend: { display: false } } }
                });
            }
        };

        window.renderSubDashboardCharts = function() { 
            const catFilter = $('#sub-filter-category').val();
            const dateStart = $('#sub-date-start').val();
            const dateEnd = $('#sub-date-end').val();
            let data = assignments.filter(a => ['sub_preventive', 'sub_reroute', 'sub_reconfigure'].includes(a.category));
            if(catFilter !== 'all') data = data.filter(a => a.category === catFilter);
            if(dateStart) data = data.filter(a => new Date(a.actionDate) >= new Date(dateStart));
            if(dateEnd) data = data.filter(a => new Date(a.actionDate) <= new Date(dateEnd));
            $('#sub-stat-total').text(data.length);
            const totalCost = data.reduce((sum, a) => sum + Number(a.expenses || 0), 0);
            $('#sub-stat-cost').text(totalCost.toLocaleString() + ' ฿');
            const activeSubs = [...new Set(data.map(a => a.subcontractor).filter(Boolean))];
            $('#sub-stat-active').text(activeSubs.length);
            const avgCost = data.length > 0 ? totalCost / data.length : 0;
            $('#sub-stat-avg').text(Math.round(avgCost).toLocaleString() + ' ฿');
            const expByStatus = {};
            data.forEach(a => { const s = a.status || 'unknown'; expByStatus[s] = (expByStatus[s] || 0) + Number(a.expenses || 0); });
            if(charts.subCostStatus) charts.subCostStatus.destroy();
            const statusCanvas = document.getElementById('chartSubCostStatus');
            if(statusCanvas) {
                charts.subCostStatus = new Chart(statusCanvas, { type: 'doughnut', data: { labels: Object.keys(expByStatus), datasets: [{ label: 'Expenses', data: Object.values(expByStatus), backgroundColor: ['#3b82f6', '#22c55e', '#eab308', '#ef4444', '#a855f7'] }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } } });
            }
            const subDataMap = {};
            data.forEach(a => { const s = a.subcontractor || 'Unknown'; if(!subDataMap[s]) subDataMap[s] = { count: 0, cost: 0 }; subDataMap[s].count++; subDataMap[s].cost += Number(a.expenses || 0); });
            const subLabels = Object.keys(subDataMap); const subCounts = subLabels.map(k => subDataMap[k].count); const subCosts = subLabels.map(k => subDataMap[k].cost);
            if(charts.subCount) charts.subCount.destroy();
            const countCanvas = document.getElementById('chartSubCount');
            if(countCanvas) {
                charts.subCount = new Chart(countCanvas, { type: 'bar', data: { labels: subLabels, datasets: [{ label: 'Job Count', data: subCounts, backgroundColor: '#3b82f6', xAxisID: 'x', }, { label: 'Total Cost (THB)', data: subCosts, backgroundColor: '#10b981', xAxisID: 'x1', }] }, options: { responsive: true, maintainAspectRatio: false, indexAxis: 'y', scales: { x: { type: 'linear', position: 'bottom', title: { display: true, text: 'Job Count' } }, x1: { type: 'linear', position: 'top', grid: { drawOnChartArea: false }, title: { display: true, text: 'Total Cost (THB)' }, ticks: { callback: function(value) { return value.toLocaleString(); } } } }, plugins: { tooltip: { callbacks: { label: function(context) { let label = context.dataset.label || ''; if (label) { label += ': '; } if (context.parsed.x !== null) { label += context.parsed.x.toLocaleString(); if(context.dataset.label.includes('Cost')) label += ' ฿'; } return label; } } } } } });
            }
            const tbody = $('#table-sub-summary'); tbody.empty(); const subAgg = {};
            data.forEach(a => { const s = a.subcontractor || 'Unknown'; if(!subAgg[s]) subAgg[s] = { name: s, total: 0, finish: 0, cost: 0 }; subAgg[s].total++; if(a.status === 'finish' || a.status === 'complete') subAgg[s].finish++; subAgg[s].cost += Number(a.expenses || 0); });
            Object.values(subAgg).forEach(row => { tbody.append(`<tr class="border-b border-gray-50 hover:bg-gray-50"><td class="p-3 font-medium text-gray-700">${row.name}</td><td class="p-3 text-center">${row.total}</td><td class="p-3 text-center text-green-600 font-bold">${row.finish}</td><td class="p-3 text-right text-brand-600 font-bold">${row.cost.toLocaleString()}</td></tr>`); });
        };

        window.updateDashboard = function() {
             const data = assignments.filter(a => a.category === currentCategoryFilter);
             
             if(currentCategoryFilter === 'plan_interruption') {
                 const counts = { new:0, process:0, complete:0, update_fms:0, cancel:0 };
                 data.forEach(a => { const s = a.status || 'new'; if(counts[s] !== undefined) counts[s]++; });
                 $('#plan-count-new').text(counts.new); $('#plan-count-process').text(counts.process); $('#plan-count-complete').text(counts.complete); $('#plan-count-updatefms').text(counts.update_fms); $('#plan-count-cancel').text(counts.cancel);
             } else if(currentCategoryFilter === 'summary_plan') {
                 // UPDATE SUMMARY PLAN JOB LIST DASHBOARD
                 const counts = { new:0, process:0, complete:0, cancel:0 };
                 data.forEach(a => { 
                     let s = a.status || 'new';
                     // Map finish to complete for this dashboard
                     if(s === 'finish') s = 'complete'; 
                     if(counts[s] !== undefined) counts[s]++; 
                 });
                 $('#sum-list-new').text(counts.new); 
                 $('#sum-list-process').text(counts.process); 
                 $('#sum-list-complete').text(counts.complete); 
                 $('#sum-list-cancel').text(counts.cancel);
             } else {
                 // ... existing logic for other dashboards ...
                 const counts = { new:0, process:0, assign:0, approve:0, finish:0, complete:0, cancel:0 };
                 const costs = { new:0, process:0, assign:0, approve:0, finish:0, complete:0, cancel:0 };
                 let grandTotal = 0;
                 data.forEach(a => { const s = a.status || 'new'; if(counts[s] !== undefined) counts[s]++; const cost = Number(a.expenses || 0); if(costs[s] !== undefined) costs[s] += cost; grandTotal += cost; });
                 if(menuConfig[currentCategoryFilter]?.isSub) {
                    $('#sub-count-new').text(counts.new); $('#sub-cost-new').text(costs.new.toLocaleString() + ' ฿');
                    $('#sub-count-process').text(counts.process); $('#sub-cost-process').text(costs.process.toLocaleString() + ' ฿');
                    $('#sub-count-assign').text(counts.assign); $('#sub-cost-assign').text(costs.assign.toLocaleString() + ' ฿');
                    $('#sub-count-approve').text(counts.approve); $('#sub-cost-approve').text(costs.approve.toLocaleString() + ' ฿');
                    $('#sub-count-finish').text(counts.finish); $('#sub-cost-finish').text(costs.finish.toLocaleString() + ' ฿');
                    $('#sub-count-cancel').text(counts.cancel); $('#sub-cost-cancel').text(costs.cancel.toLocaleString() + ' ฿');
                    $('#table-grand-total').text('Total: ' + grandTotal.toLocaleString() + ' ฿').removeClass('hidden');
                 } else {
                    $('#table-grand-total').addClass('hidden');
                    $('#team-count-new').text(counts.new); $('#team-count-process').text(counts.process); $('#team-count-complete').text(counts.finish + counts.complete); $('#team-count-cancel').text(counts.cancel);
                 }
             }
        };

        window.renderDashboardCharts = function() {
            const catFilter = $('#dash-filter-category').val();
            const dateStart = $('#dash-date-start').val();
            const dateEnd = $('#dash-date-end').val();
            let data = assignments.filter(a => a.category !== 'summary_plan');
            if(catFilter !== 'all') data = data.filter(a => a.category === catFilter);
            if(dateStart) data = data.filter(a => new Date(a.actionDate) >= new Date(dateStart));
            if(dateEnd) data = data.filter(a => new Date(a.actionDate) <= new Date(dateEnd));
            $('#stat-total').text(data.length);
            const success = data.filter(a => a.status === 'finish' || a.status === 'complete' || a.status === 'update_fms').length;
            $('#stat-success').text(data.length > 0 ? Math.round((success/data.length)*100) + '%' : '0%');
            $('#stat-success-count').text(`${success} jobs`);
            $('#stat-pending').text(data.filter(a => ['new', 'process', 'assign', 'approve'].includes(a.status)).length);
            $('#stat-cancel').text(data.filter(a => a.status === 'cancel').length);
            const statuses = ['new', 'process', 'assign', 'approve', 'finish', 'complete', 'update_fms', 'cancel'];
            const statusLabels = statuses.map(s => s.toUpperCase().replace('_', ' '));
            const statusData = statuses.map(s => data.filter(a => a.status === s).length);
            if(charts.status) charts.status.destroy();
            const ctxStatus = document.getElementById('chartStatus');
            if (ctxStatus) { charts.status = new Chart(ctxStatus, { type: 'doughnut', data: { labels: statusLabels, datasets: [{ data: statusData, backgroundColor: ['#3b82f6', '#eab308', '#a855f7', '#06b6d4', '#22c55e', '#22c55e', '#0891b2', '#ef4444'] }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } } }); }
            const dates = {}; data.forEach(a => { if(!a.actionDate) return; const d = new Date(a.actionDate).toLocaleDateString('th-TH'); dates[d] = (dates[d] || 0) + 1; });
            const sortedDateKeys = Object.keys(dates).sort((a,b) => { const da = a.split('/'); const db = b.split('/'); return new Date(da[2]-543, da[1]-1, da[0]) - new Date(db[2]-543, db[1]-1, db[0]); }).slice(-7);
            if(charts.trend) charts.trend.destroy();
            const ctxTrend = document.getElementById('chartTrend');
            if(ctxTrend) { charts.trend = new Chart(ctxTrend, { type: 'line', data: { labels: sortedDateKeys, datasets: [{ label: 'Jobs', data: sortedDateKeys.map(k => dates[k]), borderColor: '#3b82f6', tension: 0.3, fill: false }] }, options: { responsive: true, maintainAspectRatio: false } }); }
            const types = {}; data.forEach(a => { const t = a.jobType || 'Unknown'; types[t] = (types[t] || 0) + 1; });
            if(charts.jobTyp