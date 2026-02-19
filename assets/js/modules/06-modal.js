                    $('#form-action-date').val(item.actionDate ? item.actionDate.slice(0,16) : '');
                    }
                    $('#form-location').val(item.location); $('#form-remark').val(item.remark); if(item.nsRespond) $('#form-ns-respond').val(item.nsRespond).trigger('change');
                    if(conf.isSub) { 
                        $('#form-objective').val(item.objective); $('#form-expenses').val(item.expenses); $('#form-route-code-sub').val(item.routeCode); 
                        $('#form-sub-name').val(item.subcontractor);
                        // FIX: เก็บค่า Original Subcontractor ไว้ใช้ตอนเปลี่ยน Job Type กลับมา
                        $('#form-sub-name').data('original', item.subcontractor);  
                        $('#rr-next-name').text(item.subcontractor); 
                        $('.rr-label.text-brand-600').text('ทีมที่รับงานนี้ (Assigned)'); 
                    }
                    else { $('#form-due-date').val(item.dueDate); $('#form-team-req').val(item.teamReq); $('#form-req-person').val(item.reqPerson); $('#form-ref-job-id').val(item.refJobId); $('#form-gps').val(item.gps); }
                    if(conf.isSub) $('#form-due-date-sub').val(item.dueDate);
                    if(item.fileName) { $('#file-name-display').text(item.fileName); }
                    if(item.fileUrl) { $('#existing-file-link').removeClass('hidden').find('a').attr('href', item.fileUrl); }
                    $('#modal-title').html('<span class="bg-brand-100 text-brand-600 p-2 rounded-lg mr-3"><i class="fa-solid fa-pen-to-square"></i></span> แก้ไขข้อมูล ' + conf.title); 
                }
            } else {
                 generateNextInternalId().then(newId => { $('#form-internal-id').val(newId); $('#display-internal-id').text(newId); });
                 
                 if(conf.isSub) { $('.rr-label.text-brand-600').text('ทีมที่ได้รับงานนี้ (Current)'); }
                 $('#modal-title').html('<span class="bg-brand-100 text-brand-600 p-2 rounded-lg mr-3"><i class="fa-solid fa-plus"></i></span> บันทึกงานใหม่ ' + conf.title);
                 $('#file-name-display').text('คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวางที่นี่'); $('#existing-file-link').addClass('hidden');
            }
            $('#assignment-modal').removeClass('hidden'); 
        };

        window.closeModal = function() { $('#assignment-modal').addClass('hidden'); };
        window.toggleSidebar = function() { const s=document.getElementById('sidebar'); s.classList.toggle('-translate-x-full'); document.getElementById('sidebar-overlay').classList.toggle('hidden'); };
        
        window.toggleDesktopSidebar = function() {
            const s = document.getElementById('sidebar');
            const btn = document.getElementById('desktop-toggle-btn');
            
            if (s.classList.contains('lg:w-0')) {
                s.classList.remove('lg:w-0', 'lg:overflow-hidden', 'lg:border-none');
                btn.classList.remove('rotate-180');
            } else {
                s.classList.add('lg:w-0', 'lg:overflow-hidden', 'lg:border-none');
                btn.classList.add('rotate-180');
            }
        };

        window.toggleSubmenu = function(id, btn) { document.getElementById(id).classList.toggle('open'); btn.querySelector('.fa-chevron-down').classList.toggle('rotate-180'); };
        
        window.switchView = function(v) { currentView = v; updateView(); };
        
        window.updateView = function() { 
            $('.view-section').addClass('hidden'); 
            if(currentView==='dashboard_analytics') { $('#view-dashboard-analytics').removeClass('hidden'); renderDashboardCharts(); } 
            else if(currentView==='sub_dashboard') { $('#view-sub-dashboard').removeClass('hidden'); renderSubDashboardCharts(); } 
            else if(currentView==='summary_dashboard') { $('#view-summary-dashboard').removeClass('hidden'); renderSummaryDashboard(); } 
            else if(currentView==='calendar') { 
                $('#view-calendar').removeClass('hidden'); 
                window.renderCalendar(); 
            } 
            else if(currentView==='setting') { $('#view-setting').removeClass('hidden'); renderSettings(); } 
            else if(currentView==='link_support') { 
                $('#view-link-support').removeClass('hidden'); 
                renderLinkSupport(); 
            }
            else { 
                currentCategoryFilter=currentView; 
                $('#view-datatable').removeClass('hidden'); 
                const config = menuConfig[currentCategoryFilter];
                
                // Hide all dashboards first
                $('#sub-dashboard, #team-dashboard, #plan-dashboard, #summary-plan-dashboard').addClass('hidden');

                if (config && config.isSub) { 
                    $('#sub-dashboard').removeClass('hidden'); 
                    updateDashboard(); 
                } 
                else if (currentCategoryFilter === 'summary_plan') { 
                    // Show Summary Plan Job List Dashboard
                    $('#summary-plan-dashboard').removeClass('hidden'); 
                    updateDashboard();
                } 
                else if (config && config.isPlan) { 
                    $('#plan-dashboard').removeClass('hidden'); 
                    updateDashboard(); 
                } 
                else if (config && config.jobTypeKey === 'team') { 
                    $('#team-dashboard').removeClass('hidden'); 
                    updateDashboard(); 
                } 
                
                renderTable(); 
            }
            $('.nav-item').removeClass('bg-brand-50 text-brand-600 font-semibold active-nav');
            if(currentView === 'summary_plan' || currentView === 'summary_dashboard') {
                 $('#summary-menu').addClass('open');
                 $(`a[data-view="${currentView}"]`).addClass('bg-brand-50 text-brand-600 font-semibold active-nav');
            } else {
                 $(`a[data-view="${currentView}"]`).addClass('bg-brand-50 text-brand-600 font-semibold active-nav');
            }
        };

        async function fetchRoundRobinState() { if (!menuConfig[currentCategoryFilter]?.isSub) return; const subs = masterData.subcontractors || masterData.Subcontractors || []; if (subs.length === 0) { $('#rr-next-name').text('No Data'); return; } const rr = masterData.rrIndexes || {}; const catData = rr[currentCategoryFilter] || { index: 0, lastJob: '-' }; const idx = catData.index % subs.length; const prev = (idx - 1 + subs.length) % subs.length; $('#rr-prev-name').text(subs[prev]); $('#rr-prev-job').text(`Job: ${catData.lastJob}`); $('#rr-next-name').text(subs[idx]); $('#form-sub-name').val(subs[idx]); }
        async function updateRoundRobinIndex(isSkip, jobName) { const k = `rrIndexes.${currentCategoryFilter}`; const next = (masterData.rrIndexes?.[currentCategoryFilter]?.index || 0) + 1; await getSettingsRef().update({[k]: {index: next, lastJob: jobName}}).catch(() => getSettingsRef().set({rrIndexes:{[currentCategoryFilter]:{index:next, lastJob:jobName}}}, {merge:true})); fetchRoundRobinState(); }
        
        async function generateNextInternalId() {
            let targetCat = currentCategoryFilter === 'summary_dashboard' ? 'summary_plan' : currentCategoryFilter;
            const conf = menuConfig[targetCat];
            const now = new Date(); 
            const prefix = `${conf.prefix}${String(now.getFullYear()).slice(-2)}${String(now.getMonth()+1).padStart(2,'0')}`;
            
            const padLength = targetCat === 'summary_plan' ? 4 : 3;
            
            try { 
                const snapshot = await getAssignmentsRef().where('internalId', '>=', prefix).where('internalId', '<=', prefix + '\uf8ff').get(); 
                let maxNum = 0; 
                snapshot.forEach(doc => { 
                    const id = doc.data().internalId; 
                    if(id) { 
                        const num = parseInt(id.slice(prefix.length)); 
                        if(!isNaN(num) && num > maxNum) maxNum = num; 
                    } 
                }); 
                return `${prefix}${String(maxNum + 1).padStart(padLength, '0')}`; 
            } catch(e) { 
                const existingIds = assignments.filter(a => a.internalId && a.internalId.startsWith(prefix)).map(a => parseInt(a.internalId.slice(prefix.length))).sort((a,b) => b-a); 
                const nextNum = (existingIds.length > 0) ? existingIds[0] + 1 : 1; 
                return `${prefix}${String(nextNum).padStart(padLength, '0')}`; 
            }
        }
        
        window.skipRoundRobin = function() { const nsList = masterData.nsRespond || masterData.NsRespond || []; const ops = nsList.map(n => `<option value="${n}">${n}</option>`).join(''); Swal.fire({ title: 'ข้ามคิว', html: `<input id="sk-r" class="swal2-input" placeholder="สาเหตุ"><select id="sk-b" class="swal2-input"><option value="">ผู้รับผิดชอบ</option>${ops}</select>`, showCancelButton: true, preConfirm:()=>{ return {r:$('#sk-r').val(), b:$('#sk-b').val()} } }).then(r => { if(r.isConfirmed) updateRoundRobinIndex(true, `Skip: ${r.value.r}`); }); };
        window.resetRoundRobin = function() { Swal.fire({ title: 'Reset?', icon: 'warning', showCancelButton: true }).then(async r => { if(r.isConfirmed) { const k = `rrIndexes.${currentCategoryFilter}`; await getSettingsRef().update({[k]: {index:0, lastJob:'Reset'}}).catch(()=>getSettingsRef().set({rrIndexes:{[currentCategoryFilter]:{index:0, lastJob:'Reset'}}}, {merge:true})); fetchRoundRobinState(); } }); };
        window.addSettingItem = async function(key, inputId) { const value = $(`#${inputId}`).val(); if (!value) return; try { const ref = getSettingsRef(); const doc = await ref.get(); if (doc.exists) { await ref.update({ [key]: firebase.firestore.FieldValue.arrayUnion(value) }); } else { await ref.set({ [key]: [value] }, { merge: true }); } $(`#${inputId}`).val(''); Swal.fire({ icon: 'success', title: 'บันทึกเรียบร้อย', toast: true, position: 'top-end', showConfirmButton: false, timer: 1500 }); } catch (error) { console.error("Error adding setting:", error); Swal.fire('Error', 'บันทึกไม่สำเร็จ: ' + error.message, 'error'); } };
        window.removeSettingItem = function(k, v) { getSettingsRef().update({[k]: firebase.firestore.FieldValue.arrayRemove(v)}).catch(err => Swal.fire('Error', err.message, 'error')); };
        window.addNSRespond = function() { const n = $('#add-ns-name').val(); const p = $('#add-ns-phone').val(); if(n) { const val = p ? `${n} - ${p}` : n; getSettingsRef().update({nsRespond: firebase.firestore.FieldValue.arrayUnion(val)}).then(() => { $('#add-ns-name').val(''); $('#add-ns-phone').val(''); Swal.fire({ icon: 'success', title: 'เพิ่มข้อมูลเรียบร้อย', toast: true, position: 'top-end', showConfirmButton: false, timer: 1500 }); }).catch(err => Swal.fire('Error', err.message, 'error')); } };
        async function uploadToDrive(file) { return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = async function() { const content = reader.result.split(',')[1]; const formData = new URLSearchParams(); formData.append('action', 'upload'); formData.append('fileName', file.name); formData.append('mimeType', file.type); formData.append('fileData', content); try { const response = await fetch(GAS_URL, { method: 'POST', body: formData, redirect: 'follow' }); const result = await response.json(); if (result.status === 'success') { resolve(result.url); } else { reject(new Error(result.message)); } } catch (error) { reject(error); } }; reader.onerror = error => reject(error); reader.readAsDataURL(file); }); }
        async function sendToSheet(data, sheetName) { const fd = new URLSearchParams(); fd.append('action','save'); fd.append('sheetName',sheetName); fd.append('jobId',data.internalId); fd.append('fullData',JSON.stringify(data)); fetch(GAS_URL, {method:'POST', body:fd}); }
        window.confirmClearDatabase = function() { Swal.fire({title:'Reset All?', icon:'warning', showCancelButton:true}).then(r=>{ if(r.isConfirmed) { getAssignmentsRef().get().then(s=>{ s.forEach(d=>d.ref.delete()); }); initializeDatabase(true); } }); };
        function initializeDatabase(h) { const d = { nsRespond: ["Support"], subcontractors: ["Sub A", "Sub B"], rrIndexes: {} }; getSettingsRef().set(d, {merge:true}); }
        window.testConnection = function() { getSettingsRef().get().then(()=>Swal.fire('OK','Connected','success')).catch(e=>Swal.fire('Fail',e.message,'error')); };
        window.actionCancel = function(id) { Swal.fire({title: 'Cancel', input: 'text'}).then(r => { if(r.value) window.updateStatus(id, 'cancel', {cancelReason: r.value}); }); };
        window.actionAssign = function(id) { Swal.fire({title: 'Assign', input: 'text', inputPlaceholder: 'ระบุเลข AS'}).then(r => { if(r.value) { window.updateStatus(id, 'assign', { asNumber: r.value, assignDate: new Date().toISOString() }); } }); };
        window.actionApprove = function(id) { Swal.fire({title: 'Approve', text: 'ยืนยันการอนุมัติ?', showCancelButton:true}).then(r => { if(r.isConfirmed) { window.updateStatus(id, 'approve', { approveDate: new Date().toISOString() }); } }); };
        window.actionFinish = function(id) { Swal.fire({title: 'Finish', input: 'text', inputPlaceholder: 'ระบุเลข SSF'}).then(r => { if(r.value) { window.updateStatus(id, 'finish', { ssfNumber: r.value, ssfDate: new Date().toISOString() }); } }); };
        window.requestApprove = function(id) { 
            const item = assignments.find(a => a.id === id); if(!item) return; 
            let nextSubName = '-'; 
            if (masterData.subcontractors && masterData.rrIndexes) { const rr = masterData.rrIndexes[item.category]?.index || 0; const subList = masterData.subcontractors || []; if (subList.length > 0) nextSubName = subList[rr % subList.length]; } 
            const nsInfo = extractNS(item.nsRespond); const actionDateStr = fmtDate(item.actionDate); 
            let fileDisplay = '<span class="text-gray-400 text-sm italic">- ไม่มีไฟล์แนบ -</span>'; 
            if(item.fileUrl) { const isImg = item.fileUrl.match(/\.(jpeg|jpg|gif|png)$/i) || item.fileUrl.includes('googleusercontent') || item.fileUrl.includes('drive.google.com'); if(isImg) fileDisplay = `<img src="${item.fileUrl}" class="max-w-full h-auto rounded-lg border border-gray-300 shadow-sm mt-2 mx-auto" style="max-height: 250px;">`; else fileDisplay = `<div class="mt-2"><a href="${item.fileUrl}" target="_blank" class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"><i class="fa-solid fa-file-arrow-down mr-2 text-brand-500"></i> เปิดไฟล์แนบ</a></div>`; } 
            const html = `<div class="text-left font-prompt text-sm space-y-2 select-text"><div class="text-center font-bold text-xl text-gray-800 mb-4 border-b pb-3 border-gray-200"><i class="fa-solid fa-file-invoice-dollar text-yellow-500 mr-2"></i> รายการอนุมัติค่าใช้จ่าย</div><div class="grid grid-cols-12 gap-2 items-center"><div class="col-span-1 text-center text-gray-400"><i class="fa-solid fa-id-card"></i></div><div class="col-span-4 font-bold text-gray-600">Job ID :</div><div class="col-span-7 font-mono font-bold text-gray-800">${item.internalId}</div></div><div class="grid grid-cols-12 gap-2 items-center"><div class="col-span-1 text-center text-gray-400"><i class="fa-solid fa-helmet-safety"></i></div><div class="col-span-4 font-bold text-gray-600">ผู้รับเหมา :</div><div class="col-span-7"><span class="border-2 border-red-500 text-red-60