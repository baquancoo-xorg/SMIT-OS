import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// WorkItem data from CSV
const workItems = [
  // Tech Tasks
  { type: 'Epic', title: 'Tối ưu FE & Cloudflare xử lý triệt để lỗi Proxy', description: 'Đã xử lý xong file JS lớn và chuyển đổi định dạng ảnh webp. Lỗi đã giảm xuống <10%.', priority: 'Urgent', status: 'Done', sprint: 1, storyPoints: 13, dueDate: '2026-03-28', assignee: 'Đăng Khoa' },
  { type: 'Task', title: 'Xin quyền Ads Standard App FB v1 & v2', description: 'Đã gửi video review và xin thành công quyền cho 2 app đầu tiên.', priority: 'High', status: 'Done', sprint: 1, storyPoints: 5, dueDate: '2026-04-01', assignee: 'Thái Phong' },
  { type: 'Epic', title: 'Phát triển tính năng "Aha Block" (UI & Logic)', description: 'Chủ nhật đã review code, Thứ 2 (13/4) tiến hành Deploy lên Production.', priority: 'Urgent', status: 'Review', sprint: 2, storyPoints: 21, dueDate: '2026-04-14', assignee: 'Đăng Khoa' },
  { type: 'Task', title: 'Xin quyền App FB v3 & v4', description: 'Đang quay video review để xin quyền page_metadata. Sẽ gửi xin cách ngày để tránh Meta nghi ngờ.', priority: 'Medium', status: 'In Progress', sprint: 2, storyPoints: 8, dueDate: '2026-04-16', assignee: 'Thái Phong' },
  { type: 'Epic', title: 'Hoàn thiện MVP SMIT Chat (Bản 80%)', description: 'Chiều thứ 3 (14/4) sẽ có bản MVP. Thứ 5 hoàn thiện 100% trải nghiệm và logic để test.', priority: 'High', status: 'Review', sprint: 2, storyPoints: 21, dueDate: '2026-04-16', assignee: 'Huy Hoàng' },
  { type: 'Task', title: 'Tích hợp PostHog & In-app Tracking', description: 'Đã đấu nối FE. Đang mắc ở khâu tracking event rơi rớt vì web chưa chốt khung (chờ MKT).', priority: 'High', status: 'In Progress', sprint: 2, storyPoints: 8, dueDate: '2026-04-15', assignee: 'Thái Phong' },
  { type: 'Task', title: 'Nghiên cứu tính năng Quản lý Page & Super Share', description: 'Nghiên cứu tính khả thi của API. Estimate thời gian hoàn thành luồng này.', priority: 'Medium', status: 'Todo', sprint: 2, storyPoints: 5, dueDate: '2026-04-18', assignee: 'Giang Trường' },
  { type: 'Task', title: 'Triển khai AI Review Code tự động', description: 'Setup Agent tự động check bug trước khi merge code vào nhánh chính trên Github.', priority: 'High', status: 'In Progress', sprint: 2, storyPoints: 13, dueDate: '2026-04-17', assignee: 'Thái Phong' },
  { type: 'UserStory', title: 'Đấu API hiển thị tỷ giá ngoại tệ theo ngày', description: 'Cập nhật luồng đổi tỷ giá tiền tệ realtime theo API ngân hàng.', priority: 'Low', status: 'Todo', sprint: 2, storyPoints: 3, dueDate: '2026-04-19', assignee: 'Huy Hoàng' },

  // Marketing Tasks
  { type: 'Task', title: 'Tái cơ cấu ngân sách & Nội dung Facebook Ads', description: 'Rà soát toàn bộ nội dung QC cũ, phân bổ lại ngân sách. Đã chốt khung Q2 và tái cơ cấu xong.', priority: 'High', status: 'Done', sprint: 1, dueDate: '2026-04-05', assignee: 'Hà Canh' },
  { type: 'Task', title: 'Lên Brief kịch bản chi tiết 4 tuyến nội dung UGC', description: 'Hoàn thiện bảng thông tin, brief kịch bản cho 4 nỗi đau để gửi sang đội Media và KOLs.', priority: 'High', status: 'Done', sprint: 1, dueDate: '2026-04-02', assignee: 'Hà Canh' },
  { type: 'Task', title: 'Nuôi và làm ấm tài khoản forum BlackHatWorld', description: 'Hoàn thành 10 bài đầu tiên trên diễn đàn, tương tác tránh bị band account để chuẩn bị test Global.', priority: 'Medium', status: 'Review', sprint: 1, dueDate: '2026-04-12', assignee: 'Hà Canh' },
  { type: 'Task', title: 'Thiết kế Wireframe 5 Landing Pages Ads', description: 'Gửi wireframe nội dung chi tiết 5 Landing Pages mới cho đội thiết kế.', priority: 'High', status: 'In Progress', sprint: 2, dueDate: '2026-04-15', assignee: 'Hà Canh' },
  { type: 'Task', title: 'Setup Tracking In-app & Web (GA4, Pixel)', description: 'Gửi tài liệu khung Tracking in-app cho Dev. Đang chờ chốt khung UI Web để triển khai.', priority: 'Urgent', status: 'Todo', sprint: 2, dueDate: '2026-04-16', assignee: 'Hà Canh' },
  { type: 'Task', title: 'Scale ngân sách Ads 20-30%', description: 'Tăng 20-30% budget cho 2 case nội dung tốt nhất (recv474i9g, recv5U3lw).', priority: 'High', status: 'Todo', sprint: 2, dueDate: '2026-04-14', assignee: 'Hà Canh' },
  { type: 'Task', title: 'Triển khai 15 post nội dung mới + Video', description: 'Lên 15 post mới và 3-5 video ads theo chủ đề lợi ích nhanh.', priority: 'Medium', status: 'In Progress', sprint: 2, dueDate: '2026-04-19', assignee: 'Hà Canh' },

  // Media Tasks
  { type: 'Task', title: 'Mua và setup công cụ AI (VidIQ, CapCut Pro)', description: 'Đã giải ngân và setup xong tài khoản cho cả đội để tăng tốc hậu kỳ.', priority: 'Medium', status: 'Done', sprint: 1, dueDate: '2026-03-30', assignee: 'Thành Long' },
  { type: 'Task', title: 'Sản xuất TVC Sự kiện (Hoàn thành Demo v1)', description: 'Đã xong tiền kỳ và có bản Demo v1. Chờ duyệt để chỉnh sửa final.', priority: 'High', status: 'Review', sprint: 1, dueDate: '2026-04-10', assignee: 'Thành Long' },
  { type: 'Task', title: 'Quay dựng đợt 1 Video UGC & Case Study', description: 'Chờ tiếp nhận Brief Kịch bản chi tiết từ phòng Marketing để tiến hành quay dựng.', priority: 'High', status: 'Todo', sprint: 2, dueDate: '2026-04-18', assignee: 'Thành Long' },
  { type: 'Task', title: 'Quản lý & đăng 33 Video TikTok', description: 'Sản xuất và đăng 2 video ngắn mỗi ngày, follow bình luận để kéo tương tác kênh.', priority: 'High', status: 'In Progress', sprint: 2, dueDate: '2026-04-19', assignee: 'Thành Long' },
  { type: 'Task', title: 'Thiết kế Layout PDF, Avatar/Cover Sale Kit', description: 'Phục vụ trực tiếp cho đội Sale đi đánh Outbound.', priority: 'Medium', status: 'Todo', sprint: 2, dueDate: '2026-04-17', assignee: 'Thành Long' },

  // Sale Tasks
  { type: 'Task', title: 'Xử lý data tồn đọng SCRM sau Tết', description: 'Xử lý 70% sub mới, đa số là khách Adscheck click sang SMIT.', priority: 'High', status: 'Done', sprint: 1, dueDate: '2026-04-05', assignee: 'Kim Huệ' },
  { type: 'Task', title: 'Xây dựng Gem AI hỗ trợ soạn kịch bản', description: 'Tạo AI Agent hỗ trợ viết bài, dịch ngoại ngữ để chát với khách.', priority: 'Medium', status: 'Done', sprint: 1, dueDate: '2026-03-28', assignee: 'Hồng Nhung' },
  { type: 'Task', title: 'Deal Khách hàng Nelly (All In One)', description: 'Đã demo xong, khách chốt gói All in One ngân sách 500 Tỷ/20.000 TKQC. Đang chờ Tech test nốt yêu cầu custom.', priority: 'Urgent', status: 'Review', sprint: 2, dueDate: '2026-04-15', assignee: 'Kim Huệ' },
  { type: 'Task', title: 'Deal Anh Minh (40 Tỷ)', description: 'Đã tiến hành demo, khách đang giao nhân sự dùng thử nhưng chưa mặn mà lắm. Cần follow sát.', priority: 'High', status: 'In Progress', sprint: 2, dueDate: '2026-04-17', assignee: 'Hồng Nhung' },
  { type: 'Task', title: 'Hunting KH mới trên BlackHatWorld', description: 'Tìm thông tin khách hàng nước ngoài trên diễn đàn BHW và tiếp cận.', priority: 'Medium', status: 'In Progress', sprint: 2, dueDate: '2026-04-19', assignee: 'Kim Huệ' },
  { type: 'Task', title: 'Gọi kịch bản xin Referral (Cu2Cu)', description: 'Lọc khách hàng cũ đang dùng tốt để xin lời giới thiệu.', priority: 'High', status: 'In Progress', sprint: 2, dueDate: '2026-04-16', assignee: 'Hồng Nhung' },
  { type: 'Epic', title: 'Vẽ luồng UI/UX S-CRM v2 (VibeCode)', description: '(Quân làm) Thiết kế 100% bản vẽ luồng S-CRM v2 để bàn giao đội Tech vào 30/04.', priority: 'Urgent', status: 'In Progress', sprint: 2, dueDate: '2026-04-30', assignee: 'Nguyễn Quân' },
];

async function main() {
  console.log('🚀 Importing WorkItems...\n');

  // Get all sprints
  const sprints = await prisma.sprint.findMany({ orderBy: { startDate: 'asc' } });
  const sprintMap = new Map(sprints.map((s, i) => [i + 1, s.id]));
  console.log(`📅 Found ${sprints.length} sprints`);

  // Get all users
  const users = await prisma.user.findMany();
  const userMap = new Map(users.map(u => [u.fullName, u.id]));
  console.log(`👥 Found ${users.length} users`);

  // Clear existing work items
  await prisma.workItem.deleteMany();
  console.log('🗑️  Cleared existing work items\n');

  let created = 0;
  let skipped = 0;

  for (const item of workItems) {
    const sprintId = sprintMap.get(item.sprint);
    const assigneeId = userMap.get(item.assignee);

    if (!sprintId) {
      console.log(`⚠️  Skipped: Sprint ${item.sprint} not found for "${item.title}"`);
      skipped++;
      continue;
    }

    if (!assigneeId) {
      console.log(`⚠️  Skipped: User "${item.assignee}" not found for "${item.title}"`);
      skipped++;
      continue;
    }

    await prisma.workItem.create({
      data: {
        title: item.title,
        description: item.description,
        type: item.type,
        priority: item.priority,
        status: item.status,
        sprintId,
        assigneeId,
        storyPoints: item.storyPoints ?? null,
        dueDate: item.dueDate ? new Date(item.dueDate) : null,
      },
    });

    console.log(`✅ ${item.type}: ${item.title.substring(0, 50)}...`);
    created++;
  }

  console.log(`\n🎉 Import complete!`);
  console.log(`   ✅ Created: ${created}`);
  console.log(`   ⚠️  Skipped: ${skipped}`);
}

main()
  .catch((e) => {
    console.error('❌ Import failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
