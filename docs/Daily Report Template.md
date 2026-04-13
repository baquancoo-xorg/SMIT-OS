<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SMIT OS - Daily Sync Form</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; }
        /* Tùy chỉnh thanh cuộn */
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #f1f5f9; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
    </style>
</head>
<body class="bg-slate-100 py-8 px-4 font-sans text-slate-800 min-h-screen">

    <div class="max-w-4xl mx-auto space-y-6" id="app-container">
        <!-- Header Section sẽ được render bằng JS -->
    </div>

    <script>
        // --- 1. MOCK DATA ---
        const currentUser = {
            name: 'Đăng Khoa',
            role: 'Frontend Developer',
            department: 'Tech & Product',
            avatar: 'ĐK'
        };

        const assignedTasks = [
            { id: 'TASK-102', title: 'Tối ưu file ảnh WebP để giảm lỗi Proxy đầu vào', type: 'TechTask', status: 'In Progress', sprint: 'Sprint 2' },
            { id: 'TASK-103', title: 'Code giao diện Aha Block (Màn Onboarding)', type: 'TechTask', status: 'In Progress', sprint: 'Sprint 2' },
            { id: 'TASK-108', title: 'Fix bug UI nút Liên hệ Sale trên Mobile', type: 'TechTask', status: 'To Do', sprint: 'Sprint 2' },
            { id: 'TASK-115', title: 'Đấu nối API Quản lý Page (Theo yêu cầu Deal Nelly)', type: 'Epic', status: 'To Do', sprint: 'Sprint 2' }
        ];

        // State quản lý form
        let formData = {
            completedYesterday: ['TASK-102'],
            doingYesterday: ['TASK-103'],
            doingToday: ['TASK-103', 'TASK-108'],
            blockers: 'Đang thiếu API Data cấu trúc từ Backend cho màn Aha Block. File thiết kế Figma nút Liên hệ Sale trên Mobile đang bị sai tỷ lệ.',
            impact: 'high' // Giá trị mặc định cho dropdown
        };

        const todayString = "Thứ Ba, 14/04/2026";

        // --- 2. LÔ-GÍC XỬ LÝ (STATE MANAGEMENT) ---
        
        function handleYesterdayCheckbox(field, taskId) {
            const list = formData[field];
            const otherField = field === 'completedYesterday' ? 'doingYesterday' : 'completedYesterday';

            if (list.includes(taskId)) {
                // Nếu đang tick thì bỏ tick
                formData[field] = list.filter(id => id !== taskId);
            } else {
                // Nếu tick vào, thì bỏ tick ở ô còn lại (Không thể vừa Xong vừa Đang làm)
                formData[field].push(taskId);
                formData[otherField] = formData[otherField].filter(id => id !== taskId);
            }
            renderApp();
        }

        function handleTodayCheckbox(taskId) {
            const list = formData.doingToday;
            if (list.includes(taskId)) {
                formData.doingToday = list.filter(id => id !== taskId);
            } else {
                formData.doingToday.push(taskId);
            }
            renderApp();
        }

        function handleTextInput(field, value) {
            formData[field] = value;
        }

        // --- 3. RENDER GIAO DIỆN ---
        function renderApp() {
            const container = document.getElementById('app-container');
            
            // Lọc task hôm qua: Những task In Progress HOẶC những task To Do nhưng đã lỡ tay tick 'Đã xong'
            const yesterdayTasksHtml = assignedTasks
                .filter(t => t.status === 'In Progress' || formData.completedYesterday.includes(t.id))
                .map(task => {
                    const isCompleted = formData.completedYesterday.includes(task.id);
                    const isDoing = formData.doingYesterday.includes(task.id);
                    
                    return `
                        <div class="flex items-start p-3 bg-slate-50 rounded-lg border border-slate-100">
                            <div class="flex-1">
                                <div class="flex items-center space-x-2">
                                    <span class="text-[10px] font-bold bg-slate-200 text-slate-600 px-2 py-0.5 rounded uppercase">${task.id}</span>
                                    <span class="text-sm font-bold text-slate-800">${task.title}</span>
                                </div>
                            </div>
                            <div class="flex space-x-2 ml-4">
                                <label class="flex items-center px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors border ${isCompleted ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}">
                                    <input type="checkbox" class="hidden" ${isCompleted ? 'checked' : ''} onchange="handleYesterdayCheckbox('completedYesterday', '${task.id}')">
                                    <i data-lucide="check-circle-2" class="mr-1 w-3.5 h-3.5"></i> Đã xong
                                </label>
                                <label class="flex items-center px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors border ${isDoing ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}">
                                    <input type="checkbox" class="hidden" ${isDoing ? 'checked' : ''} onchange="handleYesterdayCheckbox('doingYesterday', '${task.id}')">
                                    <i data-lucide="activity" class="mr-1 w-3.5 h-3.5"></i> Vẫn đang làm
                                </label>
                            </div>
                        </div>
                    `;
                }).join('');

            // Tasks cho kế hoạch hôm nay (Hiện toàn bộ Assigned Tasks)
            const todayTasksHtml = assignedTasks.map(task => {
                const isDoingToday = formData.doingToday.includes(task.id);
                return `
                    <label class="flex items-center p-3 border-b border-slate-100 last:border-0 cursor-pointer transition-colors ${isDoingToday ? 'bg-amber-50/50' : 'hover:bg-slate-50'}">
                        <input type="checkbox" class="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500 mr-3" 
                               ${isDoingToday ? 'checked' : ''} onchange="handleTodayCheckbox('${task.id}')">
                        <div class="flex-1">
                            <span class="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded uppercase mr-2">${task.id}</span>
                            <span class="text-sm font-bold ${isDoingToday ? 'text-slate-800' : 'text-slate-600'}">${task.title}</span>
                        </div>
                        <span class="text-[10px] font-black uppercase px-2 py-1 rounded ${task.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}">
                            ${task.status}
                        </span>
                    </label>
                `;
            }).join('');

            container.innerHTML = `
                <!-- Header Section -->
                <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex items-center justify-between">
                    <div class="flex items-center space-x-4">
                        <div class="h-12 w-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-black text-xl border-2 border-indigo-200">
                            ${currentUser.avatar}
                        </div>
                        <div>
                            <h1 class="text-2xl font-black text-slate-900 flex items-center tracking-tight">
                                Báo Cáo Daily Sync
                            </h1>
                            <p class="text-slate-500 font-medium text-sm flex items-center mt-1">
                                <i data-lucide="calendar" class="w-3.5 h-3.5 mr-1"></i> ${todayString} 
                                <span class="mx-2">•</span> 
                                <span class="text-indigo-600 font-bold">${currentUser.name}</span> (${currentUser.role})
                            </p>
                        </div>
                    </div>
                    <div class="text-right">
                        <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-600 border border-indigo-100">
                            <i data-lucide="activity" class="w-3 h-3 mr-1"></i> Sprint 2 - Day 2
                        </span>
                    </div>
                </div>

                <!-- Form Body -->
                <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    
                    <!-- PHẦN 1: REVIEW HÔM QUA -->
                    <div class="p-6 border-b border-slate-100 bg-slate-50/50">
                        <h2 class="text-lg font-black text-slate-800 mb-4 flex items-center">
                            <i data-lucide="clock" class="mr-2 text-blue-500 w-5 h-5"></i>
                            1. Báo cáo công việc ngày hôm qua
                        </h2>
                        <div class="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
                            <p class="text-sm font-semibold text-slate-600 mb-2">Check các Task bạn đã xử lý hôm qua (Lấy từ hệ thống):</p>
                            <div class="space-y-3">
                                ${yesterdayTasksHtml}
                            </div>
                        </div>
                    </div>

                    <!-- PHẦN 2: BLOCKERS & TÁC ĐỘNG -->
                    <div class="p-6 border-b border-slate-100">
                        <h2 class="text-lg font-black text-slate-800 mb-4 flex items-center">
                            <i data-lucide="alert-triangle" class="mr-2 text-red-500 w-5 h-5"></i>
                            2. Khó khăn, Vấn đề & Tác động tiến độ
                        </h2>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-bold text-slate-700 mb-2">Vấn đề gặp phải / Rào cản:</label>
                                <textarea oninput="handleTextInput('blockers', this.value)"
                                    class="w-full bg-red-50/30 border border-red-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 min-h-[120px] placeholder-slate-400"
                                    placeholder="Ghi rõ vướng mắc, cần ai hỗ trợ (VD: Chờ file design, Lỗi server...)"
                                >${formData.blockers}</textarea>
                            </div>
                            <div>
                                <label class="block text-sm font-bold text-slate-700 mb-2">Đánh giá tác động đến Deadline/Tiến độ:</label>
                                <div class="mb-3">
                                    <select onchange="handleTextInput('impact', this.value)" class="w-full border border-slate-300 rounded-lg p-2.5 text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-red-500">
                                        <option value="none" ${formData.impact === 'none' ? 'selected' : ''}>🟢 Không ảnh hưởng (Tự xử lý được)</option>
                                        <option value="low" ${formData.impact === 'low' ? 'selected' : ''}>🟡 Chậm 0.5 - 1 ngày (Cần theo dõi)</option>
                                        <option value="high" ${formData.impact === 'high' ? 'selected' : ''}>🔴 Nguy cơ vỡ Deadline / Chậm Sprint (Cần hỗ trợ gấp)</option>
                                    </select>
                                </div>
                                <textarea 
                                    class="w-full border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 min-h-[70px] placeholder-slate-400"
                                    placeholder="Mô tả rủi ro (VD: Sẽ không kịp tung tính năng này trong tuần...)"
                                >Có nguy cơ trễ nửa ngày so với deadline giao diện Aha Block nếu Backend không trả API trước 14h chiều nay.</textarea>
                            </div>
                        </div>
                    </div>

                    <!-- PHẦN 3: KẾ HOẠCH HÔM NAY -->
                    <div class="p-6 bg-slate-50/50">
                        <h2 class="text-lg font-black text-slate-800 mb-4 flex items-center">
                            <i data-lucide="target" class="mr-2 text-amber-500 w-5 h-5"></i>
                            3. Kế hoạch ưu tiên trong hôm nay
                        </h2>
                        <div class="bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
                            ${todayTasksHtml}
                        </div>
                        <div class="mt-3 text-right">
                            <button class="text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center justify-end w-full">
                                <i data-lucide="plus" class="w-4 h-4 mr-1"></i> Lấy thêm Task từ Backlog
                            </button>
                        </div>
                    </div>

                    <!-- Action Footer -->
                    <div class="bg-slate-900 p-4 flex justify-between items-center px-6">
                        <p class="text-slate-400 text-xs font-medium">Báo cáo sẽ được đẩy vào kênh Slack #daily-sync-smit</p>
                        <button onclick="alert('Đã Submit Báo cáo Daily Sync!')" class="px-6 py-2.5 rounded-xl font-black text-white bg-indigo-500 hover:bg-indigo-600 shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center">
                            <i data-lucide="send" class="w-4 h-4 mr-2"></i> Submit Daily Sync
                        </button>
                    </div>

                </div>
            `;
            
            // Vẽ lại các Icon của Lucide sau khi tiêm HTML
            lucide.createIcons();
        }

        // Khởi tạo app lần đầu
        renderApp();
    </script>
</body>
</html>