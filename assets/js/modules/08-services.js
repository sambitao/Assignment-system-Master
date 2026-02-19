tem.dueDate ? fmtDate(item.dueDate, true) : '-'}</div></div>
                   <div class="grid grid-cols-12 gap-2 items-start"><div class="col-span-4 text-gray-500 font-bold">Progress :</div><div class="col-span-8"><span class="inline-block px-2 py-0.5 rounded text-white text-xs ${item.progressPercent===100?'bg-green-500':'bg-yellow-500'}">${item.progressPercent || '0'}%</span></div></div>
                   <div class="grid grid-cols-12 gap-2 items-start"><div class="col-span-4 text-gray-500 font-bold">NS Respond :</div><div class="col-span-8">${nsInfo.names}</div></div>
                   <div class="grid grid-cols-12 gap-2 items-start"><div class="col-span-4 text-gray-500 font-bold">Remark :</div><div class="col-span-8 text-gray-600 italic">${item.remark || '-'}</div></div>
                   <div class="mt-3 pt-3 border-t border-dashed border-gray-200"><div class="font-bold text-gray-500 mb-1"><i class="fa-solid fa-paperclip mr-1"></i> ไฟล์แนบ :</div><div class="text-xs">${fileLink}${fileDisplay}</div></div>
                 `;
             } else if (isSub) {
                html += `
                   <div class="font-bold text-lg border-b pb-2 mb-3 text-brand-600 flex items-center"><i class="fa-solid fa-clipboard-check mr-2"></i> รายการงานใหม่ (${conf.title})</div>
                   <div class="grid grid-cols-3 gap-1 items-start"><div class="col-span-1 text-gray-500 font-bold"><i class="fa-regular fa-clock mr-1"></i> วันที่บันทึก :</div><div class="col-span-2">${createdStr}</div></div>
                   <div class="grid grid-cols-3 gap-1 items-start"><div class="col-span-1 text-gray-500 font-bold"><i class="fa-solid fa-fingerprint mr-1"></i> Job ID :</div><div class="col-span-2 font-mono font-bold text-gray-800">${item.internalId}</div></div>
                   <div class="grid grid-cols-3 gap-1 items-center"><div class="col-span-1 text-gray-500 font-bold"><i class="fa-solid fa-helmet-safety mr-1"></i> ผู้รับเหมา :</div><div class="col-span-2"><span class="border-2 border-red-500 text-red-600 font-bold px-2 py-0.5 rounded bg-red-50 inline-block shadow-sm">${item.subcontractor || '-'}</span></div></div>
                   <div class="grid grid-cols-3 gap-1 items-start"><div class="col-span-1 text-gray-500 font-bold"><i class="fa-solid fa-screwdriver-wrench mr-1"></i> ประเภทงาน :</div><div class="col-span-2">${item.jobType}</div></div>
                   <div class="grid grid-cols-3 gap-1 items-start"><div class="col-span-1 text-gray-500 font-bold"><i class="fa-solid fa-align-left mr-1"></i> ชื่องาน :</div><div class="col-span-2">${item.description}</div></div>
                   <div class="grid grid-cols-3 gap-1 items-start"><div class="col-span-1 text-gray-500 font-bold"><i class="fa-solid fa-calendar-days mr-1"></i> ดำเนินการ :</div><div class="col-span-2 text-blue-600 font-medium">${actionDateStr}</div></div>
                   <div class="grid grid-cols-3 gap-1 items-start"><div class="col-span-1 text-gray-500 font-bold"><i class="fa-solid fa-location-dot mr-1"></i> สถานที่ :</div><div class="col-span-2">${item.location || '-'}</div></div>
                   <div class="grid grid-cols-3 gap-1 items-start"><div class="col-span-1 text-gray-500 font-bold"><i class="fa-solid fa-map-location-dot mr-1"></i> GPS :</div><div class="col-span-2 text-xs font-mono break-all bg-gray-100 p-1 rounded">${item.gps || '-'}</div></div>
                   <div class="grid grid-cols-3 gap-1 items-start"><div class="col-span-1 text-gray-500 font-bold"><i class="fa-solid fa-user-tag mr-1"></i> ผู้รับผิดชอบ :</div><div class="col-span-2">${nsInfo.names}</div></div>
                   <div class="grid grid-cols-3 gap-1 items-start"><div class="col-span-1 text-gray-500 font-bold"><i class="fa-solid fa-phone mr-1"></i> เบอร์โทร :</div><div class="col-span-2">${nsInfo.phones}</div></div>
                   <div class="grid grid-cols-3 gap-1 items-center bg-orange-50 p-2 rounded-lg border border-orange-100 mt-2"><div class="col-span-1 text-gray-600 font-bold"><i class="fa-solid fa-forward mr-1"></i> ทีมถัดไป :</div><div class="col-span-2"><span class="border-2 border-red-500 text-red-600 font-bold px-2 py-0.5 rounded bg-white inline-block shadow-sm">${nextSubName}</span></div></div>
                   <div class="mt-2 pt-2 border-t border-dashed border-gray-200"><div class="font-bold text-gray-500 mb-1"><i class="fa-solid fa-paperclip mr-1"></i> ไฟล์แนบ :</div><div class="text-xs">${fileLink}${fileDisplay}</div></div>`;
            } else if (isPlan) {
                 html += `<div class="font-bold border-b pb-2 mb-2">📋 Interruption Plan Detail</div><div>🆔 Job ID : ${item.internalId}</div><div>🛠️ Project : ${item.project || '-'}</div><div>📝 Description : ${item.description}</div><div>📅 Action Date : ${fmtDate(item.planDate, true)}</div><div>⏰ Time : ${(item.planStartTime && item.planEndTime) ? item.planStartTime + ' - ' + item.planEndTime : '-'}</div><div>📨 Sent Plan : ${fmtDate(item.sentPlanDate, true)}</div><div>💥 Impact : ${item.unplannedImpact || '-'}</div><div>👤 NS : ${nsInfo.names}</div>`;
            } else {
                 html += `<div class="font-bold border-b pb-2 mb-2">🆕 รายการงานใหม่</div><div>📅 วันที่บันทึก : ${createdStr}</div><div>🆔 Job ID : ${item.internalId}</div><div>👷 ผู้รับเหมา : ${item.subcontractor || '-'}</div><div>🛠️ ประเภทงาน : ${item.jobType}</div><div>📝 ชื่องาน : ${item.description}</div><div>🕒 วันที่ดำเนินการ : ${actionDateStr}</div><div>📍 สถานที่ : ${item.location}</div><div class="whitespace-pre-line">🟢 GPS : ${item.gps || '-'}</div><div>👤 ผู้รับผิดชอบ : ${nsInfo.names}</div><div>📞 เบอร์โทร : ${nsInfo.phones}</div><div>📎 ไฟล์แนบ : ${fileLink}</div>`;
            }
			
			// --- NEW: Add Action Buttons to Popup ---
            const actionButtons = window.getActionButtons(item, isSub, isPlan);
            const editButton = `<button onclick="Swal.close(); openModal('${item.id}')" class="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition shadow-sm"><i class="fa-solid fa-pen-to-square mr-1"></i> แก้ไข (Edit)</button>`;
            
            html += `
                <div class="mt-4 pt-3 border-t border-gray-200">
                    <div class="font-bold text-gray-500 mb-2 text-xs uppercase tracking-wider text-center">จัดการงาน (Actions)</div>
                    <div class="flex flex-wrap justify-center gap-2 items-center">
                        ${actionButtons !== '-' ? actionButtons : ''}
                        ${editButton}
                    </div>
                </div>
            `;
            // ----------------------------------------
			
            html += `</div>`;
            Swal.fire({ title: '', html: html, showCancelButton: true, confirmButtonText: '<i class="fa-regular fa-copy"></i> Copy Text', confirmButtonColor: '#06c755', cancelButtonText: 'ปิด', customClass: { container: 'font-sans', popup: 'rounded-2xl' } }).then(r => { if(r.isConfirmed) { let text = ''; 
            if (item.category === 'summary_plan') {
                text = `📋 Project Plan Detail\n🆔 Job ID: ${item.internalId}\n🛠️ Type: ${item.jobType}\n🛣️ Route: ${item.routeName} (${item.routeCode})\n📏 Dist: ${item.distance} km\n📅 Due: ${item.dueDate ? fmtDate(item.dueDate, true) : '-'}\n💥 Impact: ${item.symImpact}\n👤 NS: ${nsInfo.names}`;
            } else if (isSub) { text = `🆕 รายการงานใหม่\n📅 วันที่บันทึก : ${createdStr}\n🆔 Job ID : ${item.internalId}\n👷 ผู้รับเหมาที่รับผิดชอบ : 🟥 ${item.subcontractor || '-'} 🟥\n🛠️ ประเภทงาน : ${item.jobType}\n📝 ชื่องาน : ${item.description}\n🕒 วันที่และเวลาที่ดำเนินการ : ${actionDateStr}\n📍 สถานที่ : ${item.location || '-'}\n🟢 GPS : ${item.gps || '-'}\n👤 ผู้รับผิดชอบ : ${nsInfo.names}\n📞 เบอร์โทร : ${nsInfo.phones}\n⏭️ ผู้รับเหมาถัดไป : 🟥 ${nextSubName} 🟥\n📎 ไฟล์แนบ : ${item.fileUrl || '-'}`; } else if (isPlan) { text = `Job ID: ${item.internalId}\nDesc: ${item.description}\nDate: ${fmtDate(item.actionDate)}`; } else { text = `🆕 รายการงานใหม่\nJob ID: ${item.internalId}\nDesc: ${item.description}\nDate: ${actionDateStr}`; } fallbackCopyTextToClipboard(text); } });
        };
        function fallbackCopyTextToClipboard(text) { const textArea = document.createElement("textarea"); textArea.value = text; textArea.style.top = "0"; textArea.style.left = "0"; textArea.style.position = "fixed"; document.body.appendChild(textArea); textArea.focus(); textArea.select(); try { const successful = document.execCommand('copy'); const msg = successful ? 'successful' : 'unsuccessful'; Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'คัดลอกข้อความแล้ว', showConfirmButton: false, timer: 1500 }); } catch (err) { console.error('Fallback: Oops, unable to copy', err); } document.body.removeChild(textArea); }
        
        // NEW: Function to update sidebar notification badges
        window.updateSidebarBadges = function() {
            // Categories to track
            const cats = ['plan_interruption', 'summary_plan', 'team', 'sub_preventive', 'sub_reroute', 'sub_reconfigure'];
            
            // Reset counts
            const counts = {};
            cats.forEach(c => counts[c] = 0);

            // Calculate 'new' jobs
            assignments.forEach(a => {
                if (a.status === 'new' && counts[a.category] !== undefined) {
                    counts[a.category]++;
                }
            });

            // Update Leaf Badges
            cats.forEach(c => {
                const el = $(`#badge-${c}`);
                if (counts[c] > 0) {
                    el.text(counts[c]).removeClass('hidden');
                } else {
                    el.addClass('hidden');
                }
            });
            
            // Update Parent Menu Badges (Sum of children)
            // 1. Project Plan Parent
            const sumPlan = counts['summary_plan'];
            const badgeSumPlan = $('#badge-parent-summary');
            if(sumPlan > 0) badgeSumPlan.text(sumPlan).removeClass('hidden'); 
            else badgeSumPlan.addClass('hidden');

            // 2. Subcontractor Parent
            const sumSub = counts['sub_preventive'] + counts['sub_reroute'] + counts['sub_reconfigure'];
            const badgeSub = $('#badge-parent-sub');
            if(sumSub > 0) badgeSub.text(sumSub).removeClass('hidden'); 
            else badgeSub.addClass('hidden');
        };

        async function initAuth() { 
            try { 
                if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) { 
                    await auth.signInWithCustomToken(__initial_auth_token); 
                } else { 
                    await auth.signInAnonymously(); 
                } 
                auth.onAuthStateChanged(user => { 
                    if(user) { 
                        $('#status-text').text('Online').parent().addClass('bg-green-100 text-green-700'); 
                        getAssignmentsRef().onSnapshot(snap => { 
                            assignments = []; 
                            snap.forEach(d => assignments.push({id:d.id, ...d.data()})); 
                            assignments.sort((a,b)=>(b.internalId||'').localeCompare(a.internalId||'')); 
                            
                            // Call Badge Update here
                            window.updateSidebarBadges();
                            
                            window.updateView(); 
                        }, err => console.error("Snapshot Error:", err)); 
                        
                        getSettingsRef().onSnapshot(doc => { 
                            if(doc.exists) { 
                                masterData = doc.data(); 
                                window.renderDropdowns(); 
                                if(currentView === 'setting') window.renderSettings(); 
                            } else { 
                                initializeDatabase(false); 
                            } 
                        }, err => console.error("Settings Error:", err)); 
                    } 
                }); 
            } catch (e) { 
                console.error("Auth Error:", e); 
                Swal.fire('Connection Error', e.message, 'error'); 
            } 
        }
        
        $(document).ready(function() { 
            $('.select2').select2({ placeholder: "เลือกชื่อ", allowClear: true }); 
            $('#search-input').on('input', function() { currentPage = 1; renderTable(); }); 
            $('#filter-status').on('change', function() { currentPage = 1; renderTable(); }); 
            initAuth(); 
            $('#form-file').change(function(e) { $('#file-name-display').text(e.target.files[0] ? e.target.files[0].name : 'Click to upload'); }); 
            document.getElementById('sidebar-overlay').addEventListener('click', toggleSidebar); 
            ['#form-job-type', '#form-agency', '#form-team-req'].forEach(id => { $(id).change(function() { if($(this).val() === 'Other') $(id + '-other').addClass('show'); else $(id + '-other').removeClass('show'); }); }); 
            
            // Auto-populate Summary Dashboard Job Type Filter
            const sumDashSelect = $('#sum-dash-jobtype');
            if(sumDashSelect.length) {
                CONST_DATA.jobTypes.summary_plan.forEach(t => {
                    sumDashSelect.append(new Option(t, t));
                });
            }

            // Logic เปลี่ยนกล่อง Round Robin ตาม Job Type
            $('#form-job-type').change(function() {
                const val = $(this).val();
                const isSubMenu = menuConfig[currentCategoryFilter]?.isSub;
                if (isSubMenu) {
                    if (val === 'Special Job') {
                        $('#rr-normal-view').addClass('hidden');
                        $('#rr-special-view').removeClass('hidden');
                        // Reset sub name so user must select manually
                        $('#form-sub-name').val($('#form-manual-sub').val()); 
                    } else {
                        $('#rr-normal-view').removeClass('hidden');
                        $('#rr-special-view').addClass('hidden');
                        
                        // FIX: ตรวจสอบว่าอยู่ในโหมดแก้ไขหรือไม่
                        const docId = $('#doc-id').val();
                        if (!docId) {
                             // ถ้าเป็นงานใหม่ ให้ดึงคิวล่าสุด
                             fetchRoundRobinState();
                        } else {
                             // ถ้าแก้ไข ให้คืนค่าเดิมที่เคยบันทึกไว้ (ไม่ดึงคิวใหม่)
                             const originalSub = $('#form-sub-name').data('original');
                             if(originalSub) {
                                 $('#form-sub-name').val(originalSub);
                                 $('#rr-next-name').text(originalSub);
                             }
                        }
                    }
                }
            });

            // Sym Impact Other Toggle
            $('#form-sym-impact').change(function() {
                if($(this).val() === 'Other') $('#form-sym-impact-other').addClass('show');
                else $('#form-sym-impact-other').removeClass('show');
            });

            // Link Support Type Toggle
            $('#ls-type').change(function() {
                if($(this).val() === 'Other') {
                    $('#ls-type-other').removeClass('hidden').addClass('block').focus();
                } else {
                    $('#ls-type-other').addClass('hidden').removeClass('block');
                }
            });
        });
        
    </script>
</body>
</htm