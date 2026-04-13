import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Seeding OKRs data...');

  // Clear existing OKRs
  await prisma.keyResult.deleteMany();
  await prisma.objective.deleteMany();
  console.log('✅ Cleared existing OKRs');

  // --- L1 OBJECTIVES (Company Level) ---
  const l1Objectives = [
    {
      title: 'Bứt phá doanh thu 4,5 Tỷ bằng cách tối ưu hóa phễu chuyển đổi và rút ngắn chu kỳ bán hàng.',
      department: 'BOD',
      progressPercentage: 0,
      keyResults: {
        create: [
          { title: 'Rút ngắn Vòng đời bán hàng (Sale Cycle) trung bình xuống < 45 ngày.', progressPercentage: 0, currentValue: 0, targetValue: 45, unit: 'days' },
          { title: 'Số lượng Marketing Qualified Lead (MQL) thu về đạt tối thiểu 2.000 Leads.', progressPercentage: 0, currentValue: 0, targetValue: 2000, unit: 'leads' },
          { title: 'Tỷ lệ chuyển đổi MQL -> SQL đạt tối thiểu 40%, Pipeline rolling 7 ngày > 500 triệu.', progressPercentage: 0, currentValue: 0, targetValue: 40, unit: '%' },
        ],
      },
    },
    {
      title: 'Bảo vệ "sinh mệnh" hệ thống và Nâng cấp đột phá trải nghiệm người dùng (UX).',
      department: 'BOD',
      progressPercentage: 0,
      keyResults: {
        create: [
          { title: 'Giảm thời gian loading do lỗi Proxy xuống dưới 10%.', progressPercentage: 0, currentValue: 0, targetValue: 10, unit: '%' },
          { title: 'Đạt tỷ lệ chuyển đổi từ MQL sang PQL (Product Qualified Lead) là 50%.', progressPercentage: 0, currentValue: 0, targetValue: 50, unit: '%' },
          { title: 'Rút ngắn Time-to-value (TTV) trung bình xuống mức 24 giờ.', progressPercentage: 0, currentValue: 0, targetValue: 24, unit: 'hours' },
          { title: 'Thu thập thành công 100% dữ liệu drop-off trên hành trình UX để cung cấp insight cho T&P.', progressPercentage: 0, currentValue: 0, targetValue: 100, unit: '%' },
        ],
      },
    },
    {
      title: 'Xây dựng Brand Trust vững chắc đa nền tảng.',
      department: 'BOD',
      progressPercentage: 0,
      keyResults: {
        create: [
          { title: 'Tăng Organic Traffic từ Website mới lên mức 3.000 lượt/tháng.', progressPercentage: 0, currentValue: 0, targetValue: 3000, unit: 'visits' },
          { title: 'Đạt tối thiểu 1 video có 1.000.000 lượt xem tự nhiên.', progressPercentage: 0, currentValue: 0, targetValue: 1, unit: 'videos' },
          { title: 'Đạt trung bình 10.000 lượt tương tác/tuần từ hệ thống kênh Omni Channel.', progressPercentage: 0, currentValue: 0, targetValue: 10000, unit: 'interactions' },
        ],
      },
    },
    {
      title: 'Tự động hóa vận hành bằng AI và thiết lập nền móng Go Global.',
      department: 'BOD',
      progressPercentage: 0,
      keyResults: {
        create: [
          { title: '100% (4/4) phòng ban tích hợp thành công ít nhất 01 luồng công việc cốt lõi bằng AI Agent.', progressPercentage: 0, currentValue: 0, targetValue: 100, unit: '%' },
          { title: 'Lấy thành công huy hiệu "Partner Đối tác chính thức" với Meta.', progressPercentage: 0, currentValue: 0, targetValue: 1, unit: 'badge' },
          { title: 'Xác định và validate thành công 3 thị trường quốc tế có ROI > [X]%.', progressPercentage: 0, currentValue: 0, targetValue: 3, unit: 'markets' },
        ],
      },
    },
  ];

  for (const obj of l1Objectives) {
    await prisma.objective.create({
      data: {
        title: obj.title,
        department: obj.department,
        progressPercentage: obj.progressPercentage,
        keyResults: obj.keyResults,
      },
    });
  }
  console.log('✅ Created 4 L1 (Company) Objectives');

  // --- L2 OBJECTIVES (Department Level) ---
  
  // Tech & Product
  const techObjectives = [
    {
      title: 'Khơi thông phễu Onboarding và dọn dẹp triệt để nợ kỹ thuật (Tech Debt).',
      department: 'Tech',
      progressPercentage: 0,
      keyResults: {
        create: [
          { title: 'Giảm tỷ lệ lỗi Proxy đầu vào xuống dưới 10% và sync TKQC lần đầu < 24h.', progressPercentage: 0, currentValue: 0, targetValue: 10, unit: '%' },
          { title: 'Duy trì uptime 99.9% của tối thiểu 03 App Facebook dự phòng.', progressPercentage: 0, currentValue: 0, targetValue: 99.9, unit: '%' },
          { title: 'Release "Aha Block" và nút "Liên hệ Sale trực tiếp", góp phần rút ngắn TTV xuống 24h.', progressPercentage: 0, currentValue: 0, targetValue: 1, unit: 'release' },
          { title: 'Triển khai In-app Tracking, ghi nhận 100% dữ liệu drop-off trước 30/5/2026.', progressPercentage: 0, currentValue: 0, targetValue: 100, unit: '%' },
        ],
      },
    },
    {
      title: 'Hoàn thiện hệ sinh thái tính năng Agency để đạt Partner Meta và phục vụ Vận hành.',
      department: 'Tech',
      progressPercentage: 0,
      keyResults: {
        create: [
          { title: 'Hoàn thiện tính năng Quản lý BM, Set Ads, Quản lý Page & Agency Super Share.', progressPercentage: 0, currentValue: 0, targetValue: 1, unit: 'completion' },
          { title: 'Code và bàn giao S-CRM v2 (Dashboard, Metric Realtime) cho Sale trước 30/05/2026.', progressPercentage: 0, currentValue: 0, targetValue: 1, unit: 'completion' },
        ],
      },
    },
    {
      title: 'Làm chủ "AI Dev Cycle" để bứt phá hiệu suất nhân sự và hệ thống hóa tri thức.',
      department: 'Tech',
      progressPercentage: 0,
      keyResults: {
        create: [
          { title: 'Rút ngắn thời gian lên Wireframe tính năng mới xuống < 2 ngày nhờ AI.', progressPercentage: 0, currentValue: 0, targetValue: 2, unit: 'days' },
          { title: 'Giảm tỷ lệ bug khi deploy xuống < 10% nhờ Code Review tự động bằng AI.', progressPercentage: 0, currentValue: 0, targetValue: 10, unit: '%' },
          { title: 'Đưa SMIT Wiki AI vào vận hành, giải quyết tự động >90% câu hỏi nội bộ.', progressPercentage: 0, currentValue: 0, targetValue: 90, unit: '%' },
        ],
      },
    },
  ];

  for (const obj of techObjectives) {
    await prisma.objective.create({
      data: { title: obj.title, department: obj.department, progressPercentage: 0, keyResults: obj.keyResults },
    });
  }
  console.log('✅ Created 3 Tech Objectives');

  // Marketing
  const mktObjectives = [
    {
      title: 'Tìm ra Winning Content Formula để tạo cỗ máy Lead Gen vô tận.',
      department: 'Marketing',
      progressPercentage: 0,
      keyResults: {
        create: [
          { title: 'Mang về tối thiểu 2.000 MQLs, duy trì tỷ lệ Signup -> MQL ≥ 50%.', progressPercentage: 0, currentValue: 0, targetValue: 2000, unit: 'MQLs' },
          { title: 'Tìm ra tối thiểu 03 case quảng cáo Win (CTR ≥ 10%), kéo CPA giảm ≥ 15%.', progressPercentage: 0, currentValue: 0, targetValue: 3, unit: 'cases' },
        ],
      },
    },
    {
      title: 'Xây dựng bộ tiêu chí kiểm thử và Validate thị trường Global.',
      department: 'Marketing',
      progressPercentage: 0,
      keyResults: {
        create: [
          { title: 'Validate thành công 3 thị trường Global tiềm năng với ROI > [X]%.', progressPercentage: 0, currentValue: 0, targetValue: 3, unit: 'markets' },
          { title: 'Thu hút ít nhất 100 User Trial từ 3 thị trường trên để đánh giá chất lượng.', progressPercentage: 0, currentValue: 0, targetValue: 100, unit: 'users' },
        ],
      },
    },
    {
      title: 'Đóng gói quy trình vận hành Marketing bằng hệ thống AI AgentOps.',
      department: 'Marketing',
      progressPercentage: 0,
      keyResults: {
        create: [
          { title: 'Đưa AgentOps (AI Rule-based Ads) vào vận hành, tiết kiệm 20% ngân sách rác trước 30/6.', progressPercentage: 0, currentValue: 0, targetValue: 20, unit: '%' },
          { title: 'Xây dựng hệ thống AI SEO Blog tự động trước 30/6/2026.', progressPercentage: 0, currentValue: 0, targetValue: 1, unit: 'system' },
        ],
      },
    },
  ];

  for (const obj of mktObjectives) {
    await prisma.objective.create({
      data: { title: obj.title, department: obj.department, progressPercentage: 0, keyResults: obj.keyResults },
    });
  }
  console.log('✅ Created 3 Marketing Objectives');

  // Media
  const mediaObjectives = [
    {
      title: 'Tăng cường Brand Awareness thông qua mạng xã hội và nội dung số chuyên sâu.',
      department: 'Media',
      progressPercentage: 0,
      keyResults: {
        create: [
          { title: 'Đạt 01 video 1M view tự nhiên, tổng Follower đạt 25.000.', progressPercentage: 0, currentValue: 0, targetValue: 1, unit: 'video' },
          { title: 'Duy trì Average View Duration > 50% cho chuỗi 33 video.', progressPercentage: 0, currentValue: 0, targetValue: 50, unit: '%' },
          { title: 'Hồi sinh Group cộng đồng SMIT, tăng trưởng thêm 3.300 Members.', progressPercentage: 0, currentValue: 0, targetValue: 3300, unit: 'members' },
        ],
      },
    },
    {
      title: 'Biến Media thành "Xưởng sản xuất bằng AI" và hỗ trợ Go Global.',
      department: 'Media',
      progressPercentage: 0,
      keyResults: {
        create: [
          { title: 'Đảm bảo 100% yêu cầu ấn phẩm hoàn thành đúng deadline (ứng dụng AI).', progressPercentage: 0, currentValue: 0, targetValue: 100, unit: '%' },
          { title: 'Hỗ trợ sản xuất tài liệu, video để Mkt test Global đúng deadline 100%.', progressPercentage: 0, currentValue: 0, targetValue: 100, unit: '%' },
        ],
      },
    },
  ];

  for (const obj of mediaObjectives) {
    await prisma.objective.create({
      data: { title: obj.title, department: obj.department, progressPercentage: 0, keyResults: obj.keyResults },
    });
  }
  console.log('✅ Created 2 Media Objectives');

  // Sales
  const salesObjectives = [
    {
      title: 'Chuyển hóa tối đa cơ hội thành Doanh thu 4,5 Tỷ và quản trị Data chặt chẽ.',
      department: 'Sale',
      progressPercentage: 0,
      keyResults: {
        create: [
          { title: 'Đóng góp trực tiếp đạt 4,5 Tỷ VNĐ tổng doanh thu toàn dự án.', progressPercentage: 0, currentValue: 0, targetValue: 4500000000, unit: 'VND' },
          { title: '[INBOUND]: MQL -> SQL > 40%, Pipeline (7 ngày) luôn > 500 triệu.', progressPercentage: 0, currentValue: 0, targetValue: 40, unit: '%' },
          { title: '[OUTBOUND]: Đạt ≥ 30% doanh thu từ nguồn Sale Hunting tự chủ.', progressPercentage: 0, currentValue: 0, targetValue: 30, unit: '%' },
        ],
      },
    },
    {
      title: 'Tối ưu quy trình nội bộ để rút ngắn Sale Cycle.',
      department: 'Sale',
      progressPercentage: 0,
      keyResults: {
        create: [
          { title: 'Rút ngắn Sale Cycle trung bình cho deal mới xuống dưới 45 ngày.', progressPercentage: 0, currentValue: 0, targetValue: 45, unit: 'days' },
          { title: 'Thiết kế 1 bộ Sale Playbook để rút ngắn thời gian demo.', progressPercentage: 0, currentValue: 0, targetValue: 1, unit: 'playbook' },
          { title: 'Hoàn thiện 100% bản vẽ luồng hoạt động và UI S-CRM v2 trước 30/4/2026.', progressPercentage: 0, currentValue: 0, targetValue: 100, unit: '%' },
        ],
      },
    },
  ];

  for (const obj of salesObjectives) {
    await prisma.objective.create({
      data: { title: obj.title, department: obj.department, progressPercentage: 0, keyResults: obj.keyResults },
    });
  }
  console.log('✅ Created 2 Sales Objectives');

  console.log('\n🎉 OKRs seeding complete!');
  console.log('   • 4 L1 (Company) Objectives');
  console.log('   • 10 L2 (Department) Objectives');
  console.log('   • All progress reset to 0%');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
