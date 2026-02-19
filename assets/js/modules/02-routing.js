/div>`;
                } else {
                    let html = `<div class="flex-1 overflow-y-auto p-4 custom-scrollbar"><div class="space-y-3">`;
                    jobs.forEach(j => {
                        let statusColor = j.status==='process'?'border-l-4 border-yellow-400':(j.status==='finish'||j.status==='complete'?'border-l-4 border-green-500':'border-l-4 border-blue-500');
                        let time = j.actionDate.split('T')[1].slice(0,5);
                        
                        html += `
                        <div class="flex items-start bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition cursor-pointer ${statusColor}" onclick="showJobDetail('${j.id}')">
                            <div class="mr-4 text-center min-w-[60px]">
                                <div class="text-xl font-bold text-gray-800">${time}</div>
                                <div class="text-xs text-gray-500 uppercase font-bold mt-1 tracking-wider">${j.status}</div>
                            </div>
                            <div class="flex-1">
                                <div class="flex justify-between items-start">
                                    <h4 class="font-bold text-lg text-gray-800">${j.description}</h4>
                                    <span class="font-mono text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">${j.internalId}</span>
                                </div>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 text-sm text-gray-600">
                                    <div><i class="fa-solid fa-helmet-safety w-5 text-center text-orange-500"></i> ${j.subcontractor || j.teamReq || '-'}</div>
                                    <div><i class="fa-solid fa-location-dot w-5 text-center text-red-500"></i> ${j.location || '-'}</div>
                                    <div><i class="fa-solid fa-user w-5 text-center text-blue-500"></i> ${extractNS(j.nsRespond).names}</div>
                                    <div><i class="fa-solid fa-phone w-5 text-center text-green-500"></i> ${extractNS(j.nsRespond).phones}</div>
                                </div>
                            </div>
                            <div class="ml-4 flex items-center justify-center self-center text-gray-300">
                                <i class="fa-solid fa-chevron-right"></i>
                            </div>
                        </div>`;
                    });
                    html += `</div></div>`;
                    container.innerHTML = html;
                }
            }
        };

        // === LINK SUPPORT FUNCTIONS (NEW) ===
        window.renderLinkSupport = function() {
            const list = $('#list-link-support');
            list.empty();
            let links = masterData.linkSupport || [];
            
            // Search Filter
            const searchTerm = $('#ls-search').val() ? $('#ls-search').val().toLowerCase() : '';
            // Type Filter
            const filterType = $('#ls-filter-type').val();

            links = links.filter(l => {
                const matchesSearch = 
                    (l.name && l.name.toLowerCase().includes(searchTerm)) || 
                    (l.url && l.url.toLowerCase().includes(searchTerm)) ||
                    (l.type && l.type.toLowerCase().includes(searchTerm)) ||
                    (l.detail && l.detail.toLowerCase().includes(searchTerm));
                
                const matchesType = (filterType === 'all' || !filterType) ? true : (l.type === filterType);
                
                return matchesSearch && matchesType;
            });
            
            if (links.length === 0) {
                $('#ls-empty-state').removeClass('hidden');
                if(searchTerm || filterType !== 'all') $('#ls-empty-state p').text('ไม่พบข้อมูลที่ค้นหา');
                else $('#ls-empty-state p').text('ยังไม่มีรายการลิงก์ในระบบ');
            } else {
                $('#ls-empty-state').addClass('hidden');
                
                const originalLinks = masterData.linkSupport || [];
                
                links.forEach((item) => {
                    let originalIndex = -1;
                    for(let i=0; i<originalLinks.length; i++) {
                        if(originalLinks[i].name === item.name && originalLinks[i].url === item.url && originalLinks[i].type === item.type) {
                            originalIndex = i;
                            break;
                        }
                    }
                    
                    // Link Type Badge Color
                    let badgeColor = 'bg-gray-100 text-gray-800';
                    const t = item.type || '-';
                    if(t === 'Site Access') badgeColor = 'bg-blue-100 text-blue-800';
                    else if(t === 'Link Support') badgeColor = 'bg-purple-100 text-purple-800';
                    else if(t === 'Link File Shared') badgeColor = 'bg-orange-100 text-orange-800';
                    
                    const row = `
                        <tr class="hover:bg-gray-50 transition-colors group">
                            <td class="px-6 py-4">
                                <div class="flex items-center">
                                    <div class="flex-shrink-0 h-8 w-8 rounded-full bg-brand-50 flex items-center justify-center text-brand-500 mr-3 border border-brand-100">
                                        <i class="fa-solid fa-globe text-xs"></i>
                                    </div>
                                    <div class="text-sm font-bold text-gray-700">${item.name}</div>
                                </div>
                            </td>
                            <td class="px-6 py-4">
                                <a href="${item.url}" target="_blank" class="text-sm text-blue-600 hover:text-blue-800 hover:underline block break-all line-clamp-2" title="${item.url}">
                                    ${item.url} <i class="fa-solid fa-arrow-up-right-from-square ml-1.5 text-xs opacity-50"></i>
                                </a>
                            </td>
                            <td class="px-6 py-4 text-center">
                                <span class="px-2 py-1 text-xs font-semibold rounded-full ${badgeColor}">${t}</span>
                            </td>
                            <td class="px-6 py-4">
                                <span class="text-sm text-gray-500">${item.detail || '-'}</span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button onclick="editLinkItem(${originalIndex})" class="text-gray-300 hover:text-blue-500 transition-colors p-1.5 rounded-md hover:bg-blue-50 mr-1" title="แก้ไข">
                                    <i class="fa-solid fa-pen-to-square"></i>
                                </button>
                                <button onclick="deleteLinkItem(${originalIndex})" class="text-gray-300 hover:text-red-500 transition-colors p-1.5 rounded-md hover:bg-red-50" title="ลบ">
                                    <i class="fa-solid fa-trash-can"></i>
                                </button>
                            </td>
                        </tr>
                    `;
                    list.append(row);
                });
            }
        };

        window.saveLinkItem = async function() {
            const name = $('#ls-name').val().trim();
            let url = $('#ls-url').val().trim();
            const detail = $('#ls-detail').val().trim();
            let type = $('#ls-type').val();
            
            if(type === 'Other') {
                type = $('#ls-type-other').val().trim();
                if(!type) type = 'Other'; // Fallback if empty
            }

            const editIndexStr = $('#ls-edit-index').val();
            
            if (!name || !url || !type) {
                Swal.fire('แจ้งเตือน', 'กรุณาระบุชื่อ, URL และประเภทให้ครบถ้วน', 'warning');
                return;
            }

            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                url = 'https://' + url;
            }

            const newItem = { name, url, type, detail };
            
            try {
                const ref = getSettingsRef();
                const doc = await ref.get();
                
                if (doc.exists) {
                    let currentLinks = doc.data().linkSupport || [];
                    
                    if (editIndexStr !== "") {
                        const idx = parseInt(editIndexStr);
                        if (idx >= 0 && idx < currentLinks.length) {
                            currentLinks[idx] = newItem;
                            await ref.update({ linkSupport: currentLinks });
                            Swal.fire({ icon: 'success', title: 'แก้ไขข้อมูลเรียบร้อย', toast: true, position: 'top-end', showConfirmButton: false, timer: 1500 });
                        }
                    } else {
                        currentLinks.push(newItem);
                        await ref.update({ linkSupport: currentLinks });
                        Swal.fire({ icon: 'success', title: 'เพิ่มลิงก์เรียบร้อย', toast: true, position: 'top-end', showConfirmButton: false, timer: 1500 });
                    }
                } else {
                    await ref.set({ linkSupport: [newItem] }, { merge: true });
                    Swal.fire({ icon: 'success', title: 'เพิ่มลิงก์เรียบร้อย', toast: true, position: 'top-end', showConfirmButton: false, timer: 1500 });
                }
                
                cancelLinkEdit(); 
            } catch (error) {
                console.error("Error saving link:", error);
                Swal.fire('Error', 'บันทึกไม่สำเร็จ: ' + error.message, 'error');
            }
        };

        window.editLinkItem = function(index) {
            const links = masterData.linkSupport || [];
            if (index >= 0 && index < links.length) {
                const item = links[index];
                
                $('#ls-name').val(item.name);
                $('#ls-url').val(item.url);
                $('#ls-detail').val(item.detail || '');
                $('#ls-edit-index').val(index);
                
                // Handle Type Selection
                const predefinedTypes = ["Site Access", "Link Support", "Link File Shared"];
                if (predefinedTypes.includes(item.type)) {
                    $('#ls-type').val(item.type).trigger('change');
                } else {
                    $('#ls-type').val('Other').trigger('change');
                    $('#ls-type-other').val(item.type);
                }
                
                $('#btn-save-link').html('<i class="fa-solid fa-save mr-1"></i> บันทึก').removeClass('bg-brand-500 hover:bg-brand-600').addClass('bg-green-600 hover:bg-green-700');
                $('#btn-cancel-link').removeClass('hidden');
                
                $('#ls-name').focus();
            }
        };

        window.cancelLinkEdit = function() {
            $('#ls-name').val('');
            $('#ls-url').val('');
            $('#ls-detail').val('');
            $('#ls-type').val('').trigger('change');
            $('#ls-type-other').val('');
            $('#ls-edit-index').val('');
            
            $('#btn-save-link').html('<i class="fa-solid fa-plus mr-1"></i> เพิ่ม').removeClass('bg-green-600 hover:bg-green-700').addClass('bg-brand-500 hover:bg-brand-600');
            $('#btn-cancel-link').addClass('hidden');
        };

        window.deleteLinkItem = async function(index) {
            if(index === -1) return;
            
            Swal.fire({
                title: 'ยืนยันการลบ?',
                text: "คุณต้องการลบลิงก์นี้ใช่หรือไม่",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#ef4444',
                confirmButtonText: 'ลบ',
                cancelButtonText: 'ยกเลิก'
            }).then(async (result) => {
                if (result.isConfirmed) {
                    try {
                        const ref = getSettingsRef();
                        const doc = await ref.get();
                        if (doc.exists) {
                            const currentLinks = doc.data().linkSupport || [];
                            if (index >= 0 && index < currentLinks.length) {
                                currentLinks.splice(index, 1);
                                await ref.update({ linkSupport: currentLinks });
                                Swal.fire({ icon: 'success', title: 'ลบเรียบร้อย', toast: true, position: 'top-end', showConfirmButton: false, timer: 1500 });
                                if ($('#ls-edit-index').val() == index) cancelLinkEdit();
                            }
                        }
                    } catch (error) {
                        Swal.fire('Error', error.message, 'error');
                    }
                }
            });
        };

        // NEW: Robust Setting Render Function
        window.renderSettings = function() {
            const listSub = $('#list-subcontractors');
            const listNs = $('#list-nsRespond');
            
            if (listSub.length === 0 || listNs.length === 0) return; // Safety check

            listSub.empty();
            listNs.empty();

            // Handle case sensitivity and fallback
            const subs = masterData.subcontractors || masterData.Subcontractors || [];
            const ns = masterData.nsRespond || masterData.NsRespond || [];

            if (subs.length === 0) {
                listSub.append('<li class="text-gray-400 text-sm text-center p-2">ไม่มีข้อมูล</li>');
            } else {
                subs.forEach(item => {
                    // Determine key for removal
                    const key = masterData.subcontractors ? 'subcontractors' : 'Subcontractors';
                    listSub.append(`
                        <li class="flex justify-between items-center bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm shadow-sm">
                            <span class="font-medium text-gray-700">${item}</span>
                            <button onclick="removeSettingItem('${key}', '${item}')" class="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-red-50">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </li>
                    `);
                });
            }

            if (ns.length === 0) {
                listNs.append('<li class="text-gray-400 text-sm text-center p-2">ไม่มีข้อมูล</li>');
            } else {
                ns.forEach(item => {
                    const key = masterData.nsRespond ? 'nsRespond' : 'NsRespond';
                    listNs.append(`
                        <li class="flex justify-between items-center bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm shadow-sm">
                            <span class="font-medium text-gray-700">${item}</span>
                            <button onclick="removeSettingItem('${key}', '${item}')" class="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-red-50">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </li>
                    `);
                });
            }
     