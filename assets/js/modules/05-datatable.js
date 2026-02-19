click="actionUpdateFMS('${item.id}')" class="bg-cyan-600 text-white px-2 py-0.5 rounded text-[10px]">Update FMS</button>`;
                    }
                    return '-'; // Other job types stop at Complete
                }
				}
				
            if (!isSub) {
                if (item.status === 'new') return `<button onclick="updateStatus('${item.id}','process',{receiveDate:new Date().toISOString()})" class="bg-yellow-500 text-white px-2 py-0.5 rounded text-[10px] mr-1">Receive</button><button onclick="actionCancel('${item.id}')" class="bg-red-500 text-white px-2 py-0.5 rounded text-[10px]">Cancel</button>`;
                if (item.status === 'process') return `<button onclick="updateStatus('${item.id}','complete',{completeDate:new Date().toISOString()})" class="bg-green-500 text-white px-2 py-0.5 rounded text-[10px]">Finish</button>`;
                return '-';
            }
            switch(item.status) {
                case 'new': return `<button onclick="updateStatus('${item.id}','process',{receiveDate:new Date().toISOString()})" class="bg-yellow-500 text-white px-2 py-0.5 rounded text-[10px] mr-1">Receive</button><button onclick="actionCancel('${item.id}')" class="bg-red-500 text-white px-2 py-0.5 rounded text-[10px]">Cancel</button>`;
                case 'process': return `<button onclick="actionAssign('${item.id}')" class="bg-purple-500 text-white px-2 py-0.5 rounded text-[10px]">Assign</button>`;
                case 'assign': return `<button onclick="actionApprove('${item.id}')" class="bg-cyan-500 text-white px-2 py-0.5 rounded text-[10px]">Approve</button>`;
                case 'approve': return `<button onclick="actionFinish('${item.id}')" class="bg-green-500 text-white px-2 py-0.5 rounded text-[10px]">Finish</button>`;
                default: return '-';
            }
        };

        // === Summary Plan Specific Actions ===
        window.actionReceiveSummary = function(id) {
            // Receive moves to Process (Inprocess)
            window.updateStatus(id, 'process', { receiveDate: new Date().toISOString() });
        };

        window.actionCancelSummary = function(id) {
            const ops = (masterData.nsRespond || []).map(n => `<option value="${n}">${n}</option>`).join('');
            Swal.fire({
                title: 'ยกเลิกงาน (Cancel Job)',
                html: `
                    <div class="text-left space-y-3">
                        <div>
                            <label class="text-sm font-bold text-gray-700 block mb-1">ผู้แจ้งยกเลิก (NS Respond) <span class="text-red-500">*</span></label>
                            <select id="cancel-ns" class="swal2-select w-full m-0 border border-gray-300 rounded p-2 text-sm">
                                <option value="">เลือกชื่อ...</option>
                                ${ops}
                            </select>
                        </div>
                        <div>
                            <label class="text-sm font-bold text-gray-700 block mb-1">สาเหตุการยกเลิก (Reason) <span class="text-red-500">*</span></label>
                            <input id="cancel-reason" class="swal2-input m-0 w-full text-sm" placeholder="ระบุสาเหตุ...">
                        </div>
                    </div>
                `,
                showCancelButton: true,
                confirmButtonColor: '#ef4444',
                confirmButtonText: 'ยืนยันยกเลิก',
                preConfirm: () => {
                    const ns = document.getElementById('cancel-ns').value;
                    const reason = document.getElementById('cancel-reason').value;
                    if (!ns) Swal.showValidationMessage('กรุณาเลือกชื่อผู้แจ้งยกเลิก');
                    else if (!reason) Swal.showValidationMessage('กรุณาระบุสาเหตุ');
                    return { ns, reason };
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    window.updateStatus(id, 'cancel', { 
                        cancelBy: result.value.ns, 
                        cancelReason: result.value.reason, 
                        cancelDate: new Date().toISOString() 
                    });
                }
            });
        };

        window.actionCompleteSummary = function(id) {
            Swal.fire({
                title: 'ยืนยันจบงาน (Complete)',
                html: `
                    <div class="text-left">
                        <label class="text-sm font-bold text-gray-700 block mb-1">Project Code <span class="text-red-500">*</span></label>
                        <input id="comp-proj-code" class="swal2-input m-0 w-full text-sm" placeholder="ระบุเลข Project Code">
                    </div>
                `,
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#22c55e',
                confirmButtonText: 'บันทึก (Complete)',
                preConfirm: () => {
                    const code = document.getElementById('comp-proj-code').value;
                    if (!code) Swal.showValidationMessage('กรุณาระบุ Project Code');
                    return code;
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    window.updateStatus(id, 'complete', { 
                        projectCode: result.value,
                        progressPercent: 100, // Force 100% on complete
                        completeDate: new Date().toISOString() 
                    });
                }
            });
        };

        window.updateProgressSummary = function(id) {
            const item = assignments.find(a => a.id === id);
            if (!item) return;

            const steps = [
                { key: 'survey', label: 'สำรวจ', val: 10 },
                { key: 'plan', label: 'วางแผน', val: 10 },
                { key: 'req_approve', label: 'ขออนุมัติ', val: 10 },
                { key: 'approve', label: 'อนุมัติ', val: 10 },
                { key: 'plan_cm', label: 'Plan to CM', val: 10 },
                { key: 'cut_cable', label: 'ตัดถ่ายเคเบิล', val: 30 },
                { key: 'cleanup', label: 'เก็บงาน', val: 10 },
                { key: 'remove', label: 'รื้อสาย', val: 10 }
            ];

            const currentSteps = item.progressSteps || []; // Array of keys e.g. ['survey', 'plan']

            let checkboxes = steps.map(s => {
                const checked = currentSteps.includes(s.key) ? 'checked' : '';
                return `
                    <div class="flex items-center mb-2">
                        <input type="checkbox" id="step-${s.key}" value="${s.key}" class="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" ${checked}>
                        <label for="step-${s.key}" class="ml-2 text-sm text-gray-700 font-medium">${s.label} (${s.val}%)</label>
                    </div>
                `;
            }).join('');

            Swal.fire({
                title: 'อัปเดตความคืบหน้า (Progress)',
                html: `<div class="text-left mt-2 pl-4">${checkboxes}</div>`,
                showCancelButton: true,
                confirmButtonText: 'บันทึก',
                confirmButtonColor: '#3b82f6',
                preConfirm: () => {
                    const selected = [];
                    let total = 0;
                    steps.forEach(s => {
                        if (document.getElementById(`step-${s.key}`).checked) {
                            selected.push(s.key);
                            total += s.val;
                        }
                    });
                    return { steps: selected, percent: total > 100 ? 100 : total };
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    window.updateStatus(id, 'process', { 
                        progressSteps: result.value.steps,
                        progressPercent: result.value.percent
                    });
                }
            });
        };

        window.actionReceivePlan = function(id) { window.updateStatus(id, 'process', { receiveDate: new Date().toISOString() }); };
        window.actionCompletePlan = function(id) { Swal.fire({ title: 'ยืนยันงานเสร็จสิ้น?', text: "ต้องการเปลี่ยนสถานะเป็น Complete ใช่หรือไม่", icon: 'question', showCancelButton: true, confirmButtonColor: '#22c55e', confirmButtonText: 'ตกลง (Yes)' }).then((result) => { if (result.isConfirmed) { window.updateStatus(id, 'complete', { completeDate: new Date().toISOString() }); } }); };
        window.actionUpdateFMS = function(id) { Swal.fire({ title: 'Update FMS', html: '<label class="block text-left text-sm mb-1">วันที่อัปเดต (Date)</label><input type="date" id="fms-date" class="swal2-input">', showCancelButton: true, preConfirm: () => { const d = document.getElementById('fms-date').value; if (!d) Swal.showValidationMessage('กรุณาใส่วันที่'); return d; } }).then((result) => { if (result.isConfirmed) { window.updateStatus(id, 'update_fms', { fmsDate: result.value }); } }); };
        window.actionCancelPlan = function(id) { const ops = (masterData.nsRespond || []).map(n => `<option value="${n}">${n}</option>`).join(''); Swal.fire({ title: 'Cancel Job', html: `<div class="text-left"><label class="text-sm font-bold text-gray-700">ผู้แจ้งยกเลิก (NS Respond)</label><select id="cancel-ns" class="swal2-select w-full m-0 mb-3 border border-gray-300 rounded p-2"><option value="">เลือกชื่อ...</option>${ops}</select><label class="text-sm font-bold text-gray-700">สาเหตุการยกเลิก (Reason)</label><input id="cancel-reason" class="swal2-input m-0 w-full" placeholder="ระบุสาเหตุ..."></div>`, showCancelButton: true, confirmButtonColor: '#ef4444', preConfirm: () => { const ns = document.getElementById('cancel-ns').value; const reason = document.getElementById('cancel-reason').value; if (!ns) Swal.showValidationMessage('กรุณาเลือกชื่อผู้แจ้งยกเลิก'); return { ns, reason }; } }).then((result) => { if (result.isConfirmed) { window.updateStatus(id, 'cancel', { cancelBy: result.value.ns, cancelReason: result.value.reason, cancelDate: new Date().toISOString() }); } }); };

        window.openModal = function(id = null) {
		 // FIX: ถ้ามี ID (โหมดแก้ไข) ให้ดึง Category จาก Item นั้นมาเซ็ตเป็น Context ก่อน
            if (id) {
                const existItem = assignments.find(a => a.id === id);
                if(existItem && existItem.category) {
                    currentCategoryFilter = existItem.category;
                }
            }
            $('#assignment-form')[0].reset(); $('#doc-id').val(''); $('.select2').val(null).trigger('change');
            if(!menuConfig[currentCategoryFilter] && currentCategoryFilter !== 'summary_dashboard') currentCategoryFilter = 'team'; 
            
            let targetCat = currentCategoryFilter === 'summary_dashboard' ? 'summary_plan' : currentCategoryFilter;
            const conf = menuConfig[targetCat];
            window.renderDropdowns();
            $('.group-sub, .plan-only, .team-only, .not-plan-only, .summary-plan-only').addClass('hidden');
            $('.summary-plan-hide').removeClass('hidden'); 
            
            // Reset Special Job View
            $('#rr-normal-view').removeClass('hidden');
            $('#rr-special-view').addClass('hidden');
            $('#form-manual-sub').empty().append('<option value="">เลือกผู้รับเหมา...</option>');
            $('#form-sub-name').removeData('original'); // Clear old data

            if(targetCat === 'summary_plan') {
                $('#form-agency').removeAttr('required');
                $('#label-agency').html('Agency Inf.'); 
            } else {
                $('#form-agency').attr('required', 'required');
                $('#label-agency').html('Agency Inf. <span class="text-red-500">*</span>');
            }

            if(targetCat === 'summary_plan' && !id) $('#summary-copy-actions').removeClass('hidden'); else $('#summary-copy-actions').addClass('hidden');
            
            if(conf.isSub) { 
                $('.group-sub').removeClass('hidden'); 
                $('.not-plan-only').removeClass('hidden'); 
                
                // Populate manual sub list for Special Job
                const subs = masterData.subcontractors || masterData.Subcontractors || [];
                subs.forEach(s => $('#form-manual-sub').append(new Option(s, s)));

                if(!id) {
                    $('#rr-action-buttons').show();
                    fetchRoundRobinState(); 
                } else {
                    $('#rr-action-buttons').hide();
                }
            } else if(targetCat === 'summary_plan') { 
                $('.summary-plan-only').removeClass('hidden'); 
                $('.summary-plan-hide').addClass('hidden'); 
            } else if(conf.isPlan) { 
                $('.plan-only').removeClass('hidden'); 
                $('.not-plan-only').addClass('hidden'); 
            } else { 
                $('.team-only').removeClass('hidden'); 
                $('.not-plan-only').removeClass('hidden'); 
            }
            
            if(id) { 
                const item = assignments.find(a => a.id === id); 
                if(item) { 
                    $('#doc-id').val(item.id); $('#form-internal-id').val(item.internalId);
                    $('#form-job-type').val(item.jobType); $('#form-desc').val(item.description); $('#form-agency').val(item.agency); 
                    
                    // Trigger change to handle Special Job view if editing
                    if(conf.isSub && item.jobType === 'Special Job') {
                        $('#rr-normal-view').addClass('hidden');
                        $('#rr-special-view').removeClass('hidden');
                        $('#form-manual-sub').val(item.subcontractor);
                    }

                    if (targetCat === 'summary_plan') {
                        $('#form-route-code').val(item.routeCode); $('#form-electric-district').val(item.electricDistrict); $('#form-route-name').val(item.routeName); $('#form-side-count').val(item.sideCount); $('#form-gps-start').val(item.gpsStart); $('#form-gps-end').val(item.gpsEnd); $('#form-distance').val(item.distance); $('#form-owner').val(item.owner); $('#form-cross-req').val(item.crossReq); $('#form-due-date-summary').val(item.dueDate); 
                        
                        const impactVal = item.symImpact;
                        if(impactVal && impactVal !== 'Impact' && impactVal !== 'Non Impact' && impactVal !== 'Other' && impactVal.trim() !== '') {
                            $('#form-sym-impact').val('Other').trigger('change');
                            $('#form-sym-impact-other').val(impactVal);
                        } else if (impactVal === 'Other') {
                             $('#form-sym-impact').val('Other').trigger('change');
                        } else {
                            $('#form-sym-impact').val(impactVal).trigger('change');
                            $('#form-sym-impact-other').val('');
                        }

                    } else if(conf.isPlan) {
                        $('#form-plan-date').val(item.planDate || ''); $('#form-plan-start').val(item.planStartTime || ''); $('#form-plan-end').val(item.planEndTime || ''); $('#form-sent-plan-date').val(item.sentPlanDate || ''); $('#form-unplanned-impact').val(item.unplannedImpact || ''); $('#form-team-req').val(item.teamReq); $('#form-interruption-id-cm').val(item.cmId); $('#form-project').val(item.project); $('#form-interruption-item').val(item.itemCount); 
                    } else {
    