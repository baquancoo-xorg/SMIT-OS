import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Task data from CSV (manually extracted for reliability)
const tasksData = [
  // Sprint 1 Tasks
  {
    type: 'Epic',
    title: 'Tối ưu FE & Cloudflare xử lý triệt để lỗi Proxy',
    description: 'Đã xử lý xong file JS lớn và chuyển đổi định dạng ảnh webp. Lỗi đã giảm xuống <10%.',
    priority: 'Urgent',
    status: 'Done',
    sprint: 1,
    storyPoints: 13,
    dueDate: '2026-03-28',
    assignee: 'user_Khoa',
    linkedKr: 'kr-1.1-id',
  },
  {
    type: 'TechTask',
    title: 'Xin quyền Ads Standard App FB v1 & v2',
    description: 'Đã gửi video review và xin thành công quyền cho 2 app đầu tiên.',
    priority: 'High',
    status: 'Done',
    sprint: 1,
    storyPoints: 5,
    dueDate: '2026-04-01',
    assignee: 'user_Phong',
    linkedKr: 'kr-1.2-id',
  },
  {
    type: 'Campaign',
    title: 'Tái cơ cấu ngân sách & Nội dung Facebook Ads',
    description: 'Rà soát toàn bộ nội dung QC cũ, phân bổ lại ngân sách. Đã chốt khung Q2 và tái cơ cấu xong.',
    priority: 'High',
    status: 'Done',
    sprint: 1,
    storyPoints: null,
    dueDate: '2026-04-05',
    assignee: 'user_Canh',
    linkedKr: 'kr-1.2-mkt',
  },
  {
    type: 'MktTask',
    title: 'Lên Brief kịch bản chi tiết 4 tuyến nội dung UGC',
    description: 'Hoàn thiện bảng thông tin, brief kịch bản cho 4 nỗi đau để gửi sang đội Media và KOLs.',
    priority: 'High',
    status: 'Done',
    sprint: 1,
    storyPoints: null,
    dueDate: '2026-04-02',
    assignee: 'user_Canh',
    linkedKr: 'kr-1.1-mkt',
  },
  {
    type: 'MktTask',
    title: 'Nuôi và làm ấm tài khoản forum BlackHatWorld',
    description: 'Hoàn thành 10 bài đầu tiên trên diễn đàn, tương tác tránh bị band account để chuẩn bị test Global.',
    priority: 'Medium',
    status: 'Review',
    sprint: 1,
    storyPoints: null,
    dueDate: '2026-04-12',
    assignee: 'user_Canh',
    linkedKr: 'kr-2.1-mkt',
  },
  {
    type: 'MediaTask',
    title: 'Mua và setup công cụ AI (VidIQ, CapCut Pro)',
    description: 'Đã giải ngân và setup xong tài khoản cho cả đội để tăng tốc hậu kỳ.',
    priority: 'Medium',
    status: 'Done',
    sprint: 1,
    storyPoints: null,
    dueDate: '2026-03-30',
    assignee: 'user_Long',
    linkedKr: 'kr-2.1-media',
  },
  {
    type: 'MediaTask',
    title: 'Sản xuất TVC Sự kiện (Hoàn thành Demo v1)',
    description: 'Đã xong tiền kỳ và có bản Demo v1. Chờ duyệt để chỉnh sửa final.',
    priority: 'High',
    status: 'Review',
    sprint: 1,
    storyPoints: null,
    dueDate: '2026-04-10',
    assignee: 'user_Long',
    linkedKr: 'kr-1.1-media',
  },
  {
    type: 'SaleTask',
    title: 'Xử lý data tồn đọng SCRM sau Tết',
    description: 'Xử lý 70% sub mới, đa số là khách Adscheck click sang SMIT.',
    priority: 'High',
    status: 'Done',
    sprint: 1,
    storyPoints: null,
    dueDate: '2026-04-05',
    assignee: 'user_Hue',
    linkedKr: 'kr-1.2-sale',
  },
  {
    type: 'SaleTask',
    title: 'Xây dựng Gem AI hỗ trợ soạn kịch bản',
    description: 'Tạo AI Agent hỗ trợ viết bài, dịch ngoại ngữ để chát với khách.',
    priority: 'Medium',
    status: 'Done',
    sprint: 1,
    storyPoints: null,
    dueDate: '2026-03-28',
    assignee: 'user_Nhung',
    linkedKr: 'kr-2.2-sale',
  },
  // Sprint 2 Tasks
  {
    type: 'Epic',
    title: 'Phát triển tính năng "Aha Block" (UI & Logic)',
    description: 'Chủ nhật đã review code, Thứ 2 (13/4) tiến hành Deploy lên Production.',
    priority: 'Urgent',
    status: 'Review',
    sprint: 2,
    storyPoints: 21,
    dueDate: '2026-04-14',
    assignee: 'user_Khoa',
    linkedKr: 'kr-1.3-id',
  },
  {
    type: 'TechTask',
    title: 'Xin quyền App FB v3 & v4',
    description: 'Đang quay video review để xin quyền page_metadata. Sẽ gửi xin cách ngày để tránh Meta nghi ngờ.',
    priority: 'Medium',
    status: 'In Progress',
    sprint: 2,
    storyPoints: 8,
    dueDate: '2026-04-16',
    assignee: 'user_Phong',
    linkedKr: 'kr-1.2-id',
  },
  {
    type: 'Epic',
    title: 'Hoàn thiện MVP SMIT Chat (Bản 80%)',
    description: 'Chiều thứ 3 (14/4) sẽ có bản MVP. Thứ 5 hoàn thiện 100% trải nghiệm và logic để test.',
    priority: 'High',
    status: 'Review',
    sprint: 2,
    storyPoints: 21,
    dueDate: '2026-04-16',
    assignee: 'user_Hoang',
    linkedKr: 'kr-2.2-id',
  },
  {
    type: 'TechTask',
    title: 'Tích hợp PostHog & In-app Tracking',
    description: 'Đã đấu nối FE. Đang mắc ở khâu tracking event rơi rớt vì web chưa chốt khung (chờ MKT).',
    priority: 'High',
    status: 'In Progress',
    sprint: 2,
    storyPoints: 8,
    dueDate: '2026-04-15',
    assignee: 'user_Phong',
    linkedKr: 'kr-1.4-id',
  },
  {
    type: 'TechTask',
    title: 'Nghiên cứu tính năng Quản lý Page & Super Share',
    description: 'Nghiên cứu tính khả thi của API. Estimate thời gian hoàn thành luồng này.',
    priority: 'Medium',
    status: 'To Do',
    sprint: 2,
    storyPoints: 5,
    dueDate: '2026-04-18',
    assignee: 'user_Truong',
    linkedKr: 'kr-2.1-id',
  },
  {
    type: 'TechTask',
    title: 'Triển khai AI Review Code tự động',
    description: 'Setup Agent tự động check bug trước khi merge code vào nhánh chính trên Github.',
    priority: 'High',
    status: 'In Progress',
    sprint: 2,
    storyPoints: 13,
    dueDate: '2026-04-17',
    assignee: 'user_Phong',
    linkedKr: 'kr-3.2-id',
  },
  {
    type: 'UserStory',
    title: 'Đấu API hiển thị tỷ giá ngoại tệ theo ngày',
    description: 'Cập nhật luồng đổi tỷ giá tiền tệ realtime theo API ngân hàng.',
    priority: 'Low',
    status: 'To Do',
    sprint: 2,
    storyPoints: 3,
    dueDate: '2026-04-19',
    assignee: 'user_Hoang',
    linkedKr: 'kr-2.2-id',
  },
  {
    type: 'Campaign',
    title: 'Thiết kế Wireframe 5 Landing Pages Ads',
    description: 'Gửi wireframe nội dung chi tiết 5 Landing Pages mới cho đội thiết kế.',
    priority: 'High',
    status: 'In Progress',
    sprint: 2,
    storyPoints: null,
    dueDate: '2026-04-15',
    assignee: 'user_Canh',
    linkedKr: 'kr-1.1-mkt',
  },
  {
    type: 'MktTask',
    title: 'Setup Tracking In-app & Web (GA4, Pixel)',
    description: 'Gửi tài liệu khung Tracking in-app cho Dev. Đang chờ chốt khung UI Web để triển khai.',
    priority: 'Urgent',
    status: 'To Do',
    sprint: 2,
    storyPoints: null,
    dueDate: '2026-04-16',
    assignee: 'user_Canh',
    linkedKr: 'kr-1.1-mkt',
  },
  {
    type: 'Campaign',
    title: 'Scale ngân sách Ads 20-30%',
    description: 'Tăng 20-30% budget cho 2 case nội dung tốt nhất (recv474i9g, recv5U3lw).',
    priority: 'High',
    status: 'To Do',
    sprint: 2,
    storyPoints: null,
    dueDate: '2026-04-14',
    assignee: 'user_Canh',
    linkedKr: 'kr-1.2-mkt',
  },
  {
    type: 'MktTask',
    title: 'Triển khai 15 post nội dung mới + Video',
    description: 'Lên 15 post mới và 3-5 video ads theo chủ đề lợi ích nhanh.',
    priority: 'Medium',
    status: 'In Progress',
    sprint: 2,
    storyPoints: null,
    dueDate: '2026-04-19',
    assignee: 'user_Canh',
    linkedKr: 'kr-1.1-mkt',
  },
  {
    type: 'MediaTask',
    title: 'Quay dựng đợt 1 Video UGC & Case Study',
    description: 'Chờ tiếp nhận Brief Kịch bản chi tiết từ phòng Marketing để tiến hành quay dựng.',
    priority: 'High',
    status: 'To Do',
    sprint: 2,
    storyPoints: null,
    dueDate: '2026-04-18',
    assignee: 'user_Long',
    linkedKr: 'kr-2.2-media',
  },
  {
    type: 'MediaTask',
    title: 'Quản lý & đăng 33 Video TikTok',
    description: 'Sản xuất và đăng 2 video ngắn mỗi ngày, follow bình luận để kéo tương tác kênh.',
    priority: 'High',
    status: 'In Progress',
    sprint: 2,
    storyPoints: null,
    dueDate: '2026-04-19',
    assignee: 'user_Long',
    linkedKr: 'kr-1.2-media',
  },
  {
    type: 'MediaTask',
    title: 'Thiết kế Layout PDF, Avatar/Cover Sale Kit',
    description: 'Phục vụ trực tiếp cho đội Sale đi đánh Outbound.',
    priority: 'Medium',
    status: 'To Do',
    sprint: 2,
    storyPoints: null,
    dueDate: '2026-04-17',
    assignee: 'user_Long',
    linkedKr: 'kr-2.1-media',
  },
  {
    type: 'Deal',
    title: 'Deal Khách hàng Nelly (All In One)',
    description: 'Đã demo xong, khách chốt gói All in One ngân sách 500 Tỷ/20.000 TKQC. Đang chờ Tech test nốt yêu cầu custom.',
    priority: 'Urgent',
    status: 'Review',
    sprint: 2,
    storyPoints: null,
    dueDate: '2026-04-15',
    assignee: 'user_Hue',
    linkedKr: 'kr-1.1-sale',
  },
  {
    type: 'Deal',
    title: 'Deal Anh Minh (40 Tỷ)',
    description: 'Đã tiến hành demo, khách đang giao nhân sự dùng thử nhưng chưa mặn mà lắm. Cần follow sát.',
    priority: 'High',
    status: 'In Progress',
    sprint: 2,
    storyPoints: null,
    dueDate: '2026-04-17',
    assignee: 'user_Nhung',
    linkedKr: 'kr-1.1-sale',
  },
  {
    type: 'SaleTask',
    title: 'Hunting KH mới trên BlackHatWorld',
    description: 'Tìm thông tin khách hàng nước ngoài trên diễn đàn BHW và tiếp cận.',
    priority: 'Medium',
    status: 'In Progress',
    sprint: 2,
    storyPoints: null,
    dueDate: '2026-04-19',
    assignee: 'user_Hue',
    linkedKr: 'kr-1.3-sale',
  },
  {
    type: 'SaleTask',
    title: 'Gọi kịch bản xin Referral (Cu2Cu)',
    description: 'Lọc khách hàng cũ đang dùng tốt để xin lời giới thiệu.',
    priority: 'High',
    status: 'In Progress',
    sprint: 2,
    storyPoints: null,
    dueDate: '2026-04-16',
    assignee: 'user_Nhung',
    linkedKr: 'kr-1.2-sale',
  },
  {
    type: 'Epic',
    title: 'Vẽ luồng UI/UX S-CRM v2 (VibeCode)',
    description: '(Quân làm) Thiết kế 100% bản vẽ luồng S-CRM v2 để bàn giao đội Tech vào 30/04.',
    priority: 'Urgent',
    status: 'In Progress',
    sprint: 2,
    storyPoints: null,
    dueDate: '2026-04-30',
    assignee: 'user_Quan',
    linkedKr: 'kr-2.3-sale',
  },
];

// Mapping from CSV assignee IDs to username patterns
const assigneeMapping: Record<string, string[]> = {
  'user_Khoa': ['khoa', 'angkhoa'],
  'user_Phong': ['phong', 'ngocphong'],
  'user_Hoang': ['hoang', 'huyhoang'],
  'user_Truong': ['truong', 'giangtruong'],
  'user_Canh': ['canh', 'hacanh'],
  'user_Long': ['long', 'thanhlong'],
  'user_Hue': ['hue', 'kimhue'],
  'user_Nhung': ['nhung', 'hongnhung'],
  'user_Quan': ['quan', 'nguyenquan'],
};

async function main() {
  console.log('🗑️  Clearing existing WorkItems...\n');

  const count = await prisma.workItem.count();
  console.log(`📊 Found ${count} existing WorkItems to delete`);

  await prisma.workItem.deleteMany({});

  console.log('✅ All WorkItems deleted\n');
  console.log('🚀 Seeding WorkItems from Sprint 1 & 2 tasks...\n');

  // Get all users to map usernames to IDs
  const users = await prisma.user.findMany();
  console.log(`📊 Found ${users.length} users in database`);

  // Create a map of username patterns to user IDs
  const userMap = new Map<string, string>();
  users.forEach(user => {
    const username = user.username.toLowerCase();
    Object.entries(assigneeMapping).forEach(([csvId, patterns]) => {
      const matches = patterns.some(pattern => username.includes(pattern));
      if (matches) {
        if (!userMap.has(csvId)) {
          userMap.set(csvId, user.id);
          console.log(`   Mapped ${csvId} → ${user.fullName} (${user.username})`);
        }
      }
    });
  });

  // Fallback: If user_Quan is not mapped, find BOD department user
  if (!userMap.has('user_Quan')) {
    const bodUser = users.find(u => u.departments.includes('BOD'));
    if (bodUser) {
      userMap.set('user_Quan', bodUser.id);
      console.log(`   Fallback mapped user_Quan → ${bodUser.fullName} (${bodUser.username})`);
    }
  }

  // Get sprints
  const sprints = await prisma.sprint.findMany({
    orderBy: { name: 'asc' },
  });
  console.log(`\n📊 Found ${sprints.length} sprints`);
  sprints.forEach(sprint => {
    console.log(`   ${sprint.name}: ${sprint.id}`);
  });

  // Map sprint numbers to IDs
  const sprintMap = new Map<number, string>();
  sprints.forEach((sprint, index) => {
    sprintMap.set(index + 1, sprint.id);
  });

  // Get all KeyResults to attempt mapping linkedKrId
  const keyResults = await prisma.keyResult.findMany();
  console.log(`\n📊 Found ${keyResults.length} KeyResults`);

  console.log('\n📝 Creating WorkItems...\n');

  let created = 0;
  let errors = 0;

  for (const task of tasksData) {
    try {
      const assigneeId = userMap.get(task.assignee) || null;
      const sprintId = sprintMap.get(task.sprint) || null;

      // Preserve original types from CSV - do NOT normalize
      // Types: Epic, TechTask, UserStory, Campaign, MktTask, MediaTask, SaleTask, Deal
      const normalizedType = task.type;

      await prisma.workItem.create({
        data: {
          title: task.title,
          description: task.description,
          type: normalizedType,
          priority: task.priority,
          status: task.status,
          assigneeId,
          sprintId,
          storyPoints: task.storyPoints,
          dueDate: new Date(task.dueDate),
          startDate: new Date(task.dueDate), // Placeholder, can be updated later
        },
      });

      created++;
      console.log(`✅ [${task.type}] ${task.title.substring(0, 60)}...`);
    } catch (error) {
      errors++;
      console.error(`❌ Failed to create task: ${task.title}`, error);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('🎉 WorkItems seeding complete!');
  console.log(`   • ${created} tasks created successfully`);
  console.log(`   • ${errors} tasks failed`);
  console.log('='.repeat(60));
}

main()
  .catch((e) => {
    console.error('❌ Failed to clear and re-seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
