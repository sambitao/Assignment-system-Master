0 font-bold px-2 py-0.5 rounded bg-red-50 inline-block shadow-sm">${item.subcontractor || '-'}</span></div></div><div class="grid grid-cols-12 gap-2 items-start"><div class="col-span-1 text-center text-gray-400 mt-1"><i class="fa-solid fa-tools"></i></div><div class="col-span-4 font-bold text-gray-600 mt-1">ประเภทงาน :</div><div class="col-span-7">${item.jobType}</div></div><div class="grid grid-cols-12 gap-2 items-start"><div class="col-span-1 text-center text-gray-400 mt-1"><i class="fa-solid fa-comment-alt"></i></div><div class="col-span-4 font-bold text-gray-600 mt-1">ชื่องาน :</div><div class="col-span-7">${item.description}</div></div><div class="grid grid-cols-12 gap-2 items-start"><div class="col-span-1 text-center text-gray-400 mt-1"><i class="fa-solid fa-building"></i></div><div class="col-span-4 font-bold text-gray-600 mt-1">หน่วยงานแจ้ง :</div><div class="col-span-7">${item.agency || '-'}</div></div><div class="grid grid-cols-12 gap-2 items-center"><div class="col-span-1 text-center text-gray-400"><i class="fa-solid fa-route"></i></div><div class="col-span-4 font-bold text-gray-600">Code :</div><div class="col-span-7 font-mono">${item.routeCode || '-'}</div></div><div class="grid grid-cols-12 gap-2 items-center bg-yellow-50 p-1.5 rounded-lg -mx-2"><div class="col-span-1 text-center text-gray-400"><i class="fa-solid fa-coins text-yellow-600"></i></div><div class="col-span-4 font-bold text-gray-600">ประมาณราคา :</div><div class="col-span-7"><span class="border-2 border-red-500 text-red-600 font-bold px-2 py-0.5 rounded bg-white inline-block shadow-sm">${(item.expenses || '0').toLocaleString()} ฿</span></div></div><div class="grid grid-cols-12 gap-2 items-center"><div class="col-span-1 text-center text-gray-400"><i class="fa-solid fa-calendar-day"></i></div><div class="col-span-4 font-bold text-gray-600">วันดำเนินการ :</div><div class="col-span-7 text-blue-600 font-medium">${actionDateStr}</div></div><div class="grid grid-cols-12 gap-2 items-start"><div class="col-span-1 text-center text-gray-400 mt-1"><i class="fa-solid fa-user-tie"></i></div><div class="col-span-4 font-bold text-gray-600 mt-1">ผู้รับผิดชอบ :</div><div class="col-span-7">${nsInfo.names}</div></div><div class="grid grid-cols-12 gap-2 items-center"><div class="col-span-1 text-center text-gray-400"><i class="fa-solid fa-phone"></i></div><div class="col-span-4 font-bold text-gray-600">เบอร์โทร :</div><div class="col-span-7">${nsInfo.phones}</div></div><div class="grid grid-cols-12 gap-2 items-center mt-2 pt-2 border-t border-gray-100"><div class="col-span-1 text-center text-gray-400"><i class="fa-solid fa-forward text-brand-500"></i></div><div class="col-span-4 font-bold text-gray-600">ทีมถัดไป :</div><div class="col-span-7"><span class="border-2 border-red-500 text-red-600 font-bold px-2 py-0.5 rounded bg-white inline-block shadow-sm">${nextSubName}</span></div></div><div class="mt-4 pt-3 border-t-2 border-dashed border-gray-200 text-center"><div class="font-bold text-gray-500 mb-2 text-xs uppercase tracking-wider">ไฟล์แนบ (Attachment)</div>${fileDisplay}</div></div>`; Swal.fire({ title: '', html: html, width: '550px', showCancelButton: true, confirmButtonText: '<i class="fa-brands fa-line text-lg mr-2"></i> Copy for LINE', confirmButtonColor: '#06c755', cancelButtonText: 'ปิด', customClass: { container: 'font-sans', popup: 'rounded-2xl' } }).then((result) => { if(result.isConfirmed) { const text = `💸 รายการอนุมัติค่าใช้จ่าย\n🆔 Job ID : ${item.internalId}\n👷 ผู้รับเหมาที่รับผิดชอบ : 🟥 ${item.subcontractor || '-'} 🟥\n🛠️ ประเภทงาน : ${item.jobType}\n📝 ชื่องาน : ${item.description}\n🏢 หน่วยงานที่แจ้ง : ${item.agency || '-'}\n🔢 Code : ${item.routeCode || '-'}\n💰 ประมาณราคา : 🟥 ${(item.expenses || '0').toLocaleString()} ฿ 🟥\n📅 วันที่และเวลาที่ดำเนินการ : ${actionDateStr}\n👤 ผู้รับผิดชอบ : ${nsInfo.names}\n📞 เบอร์โทร : ${nsInfo.phones}\n⏭️ ผู้รับเหมาถัดไป : 🟥 ${nextSubName} 🟥\n📎 ไฟล์แนบ : ${item.fileUrl || '-'}`; fallbackCopyTextToClipboard(text); } }); };
        window.exportExcel = function() { const dt = document.getElementById('data-table'); if(!dt || dt.rows.length <= 1) { Swal.fire('Info','ไม่มีข้อมูลให้ Export','info'); return; } const wb = XLSX.utils.table_to_book(dt, {sheet: "Data"}); XLSX.writeFile(wb, 'Assignment_Data.xlsx'); };
        window.getLocation = function() { if(!navigator.geolocation) { Swal.fire('Error','Browser not support','error'); return; } $.LoadingOverlay("show"); navigator.geolocation.getCurrentPosition(p => { $.LoadingOverlay("hide"); const loc = `${p.coords.latitude},${p.coords.longitude}`; const url = `https://www.google.com/maps?q=${loc}`; const old = $('#form-gps').val(); $('#form-gps').val(old ? old + '\n' + url : url); }, e => { $.LoadingOverlay("hide"); Swal.fire('Error',e.message,'error'); }); };
        window.saveAssignment = async function() { 
            $.LoadingOverlay("show", { text: "Processing..." });
            const docId = $('#doc-id').val();
            // Use local mapping if in dashboard mode
            let saveCat = currentCategoryFilter === 'summary_dashboard' ? 'summary_plan' : currentCategoryFilter;
            const config = menuConfig[saveCat];
            if (!config) { $.LoadingOverlay("hide"); Swal.fire('Error','Please select a menu first','error'); return; }
            
            let fileUrl = $('#form-file-url').val();
            const fileInput = $('#form-file')[0];
            if (fileInput.files.length > 0) { try { $.LoadingOverlay("text", "Uploading to Drive..."); fileUrl = await uploadToDrive(fileInput.files[0]); } catch (uploadError) { $.LoadingOverlay("hide"); Swal.fire('Upload Failed', 'Cannot upload file to Drive. Please try again.', 'error'); return; } }
            let data = { category: saveCat || '', internalId: $('#form-internal-id').val() || '', updatedAt: firebase.firestore.FieldValue.serverTimestamp(), jobType: $('#form-job-type').val() || '', description: $('#form-desc').val() || '', agency: $('#form-agency').val() || '', location: $('#form-location').val() || '', remark: $('#form-remark').val() || '', nsRespond: $('#form-ns-respond').val() || [], };
            if (saveCat === 'summary_plan') {
                data.routeCode = $('#form-route-code').val(); data.electricDistrict = $('#form-electric-district').val(); data.routeName = $('#form-route-name').val(); data.sideCount = $('#form-side-count').val(); data.gpsStart = $('#form-gps-start').val(); data.gpsEnd = $('#form-gps-end').val(); data.distance = $('#form-distance').val(); data.owner = $('#form-owner').val(); data.crossReq = $('#form-cross-req').val(); data.dueDate = $('#form-due-date-summary').val(); 
                
                // Save Sym Impact Logic
                let symVal = $('#form-sym-impact').val();
                if(symVal === 'Other') {
                    symVal = $('#form-sym-impact-other').val();
                }
                data.symImpact = symVal;

                const existingItem = docId ? assignments.find(a => a.id === docId) : null; data.actionDate = existingItem ? existingItem.actionDate : new Date().toISOString(); data.planDate = null; data.planStartTime = null; data.planEndTime = null;
            } else if (config.isPlan) {
                const pDate = $('#form-plan-date').val(); const pStart = $('#form-plan-start').val(); const pEnd = $('#form-plan-end').val(); data.actionDate = (pDate && pStart) ? `${pDate}T${pStart}` : (pDate ? `${pDate}T00:00` : new Date().toISOString()); data.planDate = pDate; data.planStartTime = pStart; data.planEndTime = pEnd; data.sentPlanDate = $('#form-sent-plan-date').val(); data.unplannedImpact = $('#form-unplanned-impact').val(); data.cmId = $('#form-interruption-id-cm').val() || ''; data.project = $('#form-project').val() || ''; data.itemCount = $('#form-interruption-item').val() || ''; data.teamReq = $('#form-team-req').val() || ''; data.gps = ''; data.fileName = ''; data.fileUrl = '';
            } else {
                data.actionDate = $('#form-action-date').val() || ''; data.fileName = $('#file-name-display').text() || ''; data.fileUrl = fileUrl || ''; data.gps = $('#form-gps').val() || '';
                if (config.isSub) { 
                    data.dueDate = $('#form-due-date-sub').val() || ''; 
                    data.objective = $('#form-objective').val() || ''; 
                    data.expenses = $('#form-expenses').val() || ''; 
                    data.routeCode = $('#form-route-code-sub').val() || ''; 
                    data.subcontractor = $('#form-sub-name').val() || ''; 
                }
                else { data.dueDate = $('#form-due-date').val() || ''; data.teamReq = $('#form-team-req').val() || ''; data.reqPerson = $('#form-req-person').val() || ''; data.refJobId = $('#form-ref-job-id').val() || ''; }
            }
            if(!docId) { data.createdAt = firebase.firestore.FieldValue.serverTimestamp(); data.status = 'new'; }
            try {
                const nowIso = new Date().toISOString();
                if(docId) {
                    await getAssignmentsRef().doc(docId).update(data);
                    const existingItem = assignments.find(a => a.id === docId);
                    if (existingItem) { const mergedData = { ...existingItem, ...data }; mergedData.updatedAt = nowIso; await sendToSheet(mergedData, config.sheetName); } 
                    else { data.updatedAt = nowIso; await sendToSheet(data, config.sheetName); }
                } else {
                    await getAssignmentsRef().add(data);
                    // แก้ไข: ถ้าเป็น Special Job ไม่ต้องอัปเดต Round Robin
                    if(config.isSub && !docId && data.jobType !== 'Special Job') { 
                        await updateRoundRobinIndex(false, data.description); 
                    }
                    let sheetData = { ...data }; sheetData.createdAt = nowIso; sheetData.updatedAt = nowIso; await sendToSheet(sheetData, config.sheetName); 
                }
                $.LoadingOverlay("hide"); closeModal(); Swal.fire('Saved', '', 'success');
            } catch(e) { $.LoadingOverlay("hide"); Swal.fire('Error', e.message, 'error'); }
        };
        window.updateStatus = function(id, status, extra) { $.LoadingOverlay("show"); getAssignmentsRef().doc(id).update({status: status, ...extra}).then(async () => { const item = assignments.find(a => a.id === id); if(item) { const u = {...item, status, ...extra}; const c = menuConfig[u.category]; if(c) await sendToSheet(u, c.sheetName); } $.LoadingOverlay("hide"); }).catch(e => { $.LoadingOverlay("hide"); Swal.fire('Error',e.message,'error'); }); };
        window.deleteAssignment = function(id) { Swal.fire({ title: 'Delete?', icon: 'warning', showCancelButton: true }).then((r) => { if (r.isConfirmed) getAssignmentsRef().doc(id).delete(); }); };
        window.viewDetail = function(id) { 
            const item = assignments.find(a => a.id === id); if(!item) return; const nsInfo = extractNS(item.nsRespond); const conf = menuConfig[item.category]; const isSub = conf && conf.isSub; const isPlan = conf && conf.isPlan; const fileLink = item.fileUrl ? `<a href="${item.fileUrl}" target="_blank" class="text-blue-500 hover:underline break-all">${item.fileUrl}</a>` : '-'; const fileDisplay = (item.fileUrl && (item.fileUrl.match(/\.(jpeg|jpg|gif|png)$/) != null || item.fileUrl.includes('googleusercontent') || item.fileUrl.includes('drive.google.com'))) ? `<br><img src="${item.fileUrl}" class="mt-2 rounded-lg max-h-48 object-cover border border-gray-200" alt="Attached Image">` : ''; 
            
            // FIX: แก้ไขการคำนวณ Next Team ให้เป็น Relative ต่อจากงานนี้ ไม่ใช่ Global Index
            let nextSubName = '-'; 
            if (isSub && masterData.subcontractors) { 
                const subList = masterData.subcontractors || []; 
                if (subList.length > 0) {
                    const currentSub = item.subcontractor;
                    const currentIndex = subList.indexOf(currentSub);
                    if (currentIndex !== -1) {
                         // ถ้าหาเจอ ให้เอาตัวถัดไปในลิสต์ (วนกลับถ้าสุด)
                         nextSubName = subList[(currentIndex + 1) % subList.length];
                    }
                }
            } 
            
            const createdStr = item.createdAt ? fmtDate(item.createdAt) : '-'; const actionDateStr = fmtDate(item.actionDate); let html = `<div class="text-left text-sm space-y-3 font-prompt">`;
            
			 if (item.category === 'summary_plan') {
                 html += `
                   <div class="font-bold text-lg border-b pb-2 mb-3 text-brand-600 flex items-center"><i class="fa-solid fa-file-contract mr-2"></i> รายละเอียดงาน (Project Plan)</div>
                   <div class="grid grid-cols-12 gap-2 items-start"><div class="col-span-4 text-gray-500 font-bold">Job ID :</div><div class="col-span-8 font-mono font-bold text-gray-800">${item.internalId}</div></div>
                   <div class="grid grid-cols-12 gap-2 items-start"><div class="col-span-4 text-gray-500 font-bold">Job Type :</div><div class="col-span-8">${item.jobType || '-'}</div></div>
                   <div class="grid grid-cols-12 gap-2 items-start"><div class="col-span-4 text-gray-500 font-bold">Project Code :</div><div class="col-span-8 text-blue-600 font-bold">${item.projectCode || '-'}</div></div>
                   <div class="grid grid-cols-12 gap-2 items-start"><div class="col-span-4 text-gray-500 font-bold">Route Code :</div><div class="col-span-8 font-mono text-gray-700">${item.routeCode || '-'}</div></div>
                   <div class="grid grid-cols-12 gap-2 items-start"><div class="col-span-4 text-gray-500 font-bold">Route Name :</div><div class="col-span-8">${item.routeName || '-'}</div></div>
                   <div class="grid grid-cols-12 gap-2 items-start"><div class="col-span-4 text-gray-500 font-bold">Electric Dist. :</div><div class="col-span-8">${item.electricDistrict || '-'}</div></div>
                   <div class="grid grid-cols-12 gap-2 items-start"><div class="col-span-4 text-gray-500 font-bold">Side Count :</div><div class="col-span-8">${item.sideCount || '-'}</div></div>
                   <div class="grid grid-cols-12 gap-2 items-start"><div class="col-span-4 text-gray-500 font-bold">Distance :</div><div class="col-span-8 font-bold">${item.distance || '-'} km.</div></div>
                   <div class="grid grid-cols-12 gap-2 items-start"><div class="col-span-4 text-gray-500 font-bold">Owner :</div><div class="col-span-8">${item.owner || '-'}</div></div>
                   <div class="grid grid-cols-12 gap-2 items-start"><div class="col-span-4 text-gray-500 font-bold">Cross Req :</div><div class="col-span-8">${item.crossReq || '-'}</div></div>
                   <div class="grid grid-cols-12 gap-2 items-start"><div class="col-span-4 text-gray-500 font-bold">Sym Impact :</div><div class="col-span-8 text-orange-600 font-bold">${item.symImpact || '-'}</div></div>
                   <div class="grid grid-cols-12 gap-2 items-start"><div class="col-span-4 text-gray-500 font-bold">GPS Start :</div><div class="col-span-8 text-xs font-mono break-all text-gray-600 bg-gray-50 p-1 rounded">${item.gpsStart || '-'}</div></div>
                   <div class="grid grid-cols-12 gap-2 items-start"><div class="col-span-4 text-gray-500 font-bold">GPS End :</div><div class="col-span-8 text-xs font-mono break-all text-gray-600 bg-gray-50 p-1 rounded">${item.gpsEnd || '-'}</div></div>
                   <div class="grid grid-cols-12 gap-2 items-start"><div class="col-span-4 text-gray-500 font-bold">Due Date :</div><div class="col-span-8">${i