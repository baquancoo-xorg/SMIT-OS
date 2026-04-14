import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Seeding OKRs Q2/2026...');

  // Clear existing OKRs
  await prisma.keyResult.deleteMany();
  await prisma.objective.deleteMany();
  console.log('✅ Cleared existing OKRs');

  // Get users for ownership
  const users = await prisma.user.findMany({
    where: { username: { in: ['dominium', 'thaiphong', 'hacanh', 'thanhlong'] } },
  });
  const userMap = Object.fromEntries(users.map((u) => [u.username, u.id]));

  // ==============================
  // L1 OBJECTIVES (Company Level)
  // Owner: Nguyễn Quân (dominium)
  // ==============================
  const l1Data = [
    {
      title: 'Bứt phá doanh thu 4,5 Tỷ bằng cách tối ưu hóa phễu chuyển đổi và rút ngắn chu kỳ bán hàng.',
      keyResults: [
        { title: '[KR 1.1] Rút ngắn Vòng đời bán hàng (Sale Cycle) trung bình xuống < 45 ngày.', targetValue: 45, unit: 'days' },
        { title: '[KR 1.2] Số lượng MQL thu về đạt tối thiểu 2.000 Leads.', targetValue: 2000, unit: 'leads' },
        { title: '[KR 1.3] Tỷ lệ chuyển đổi MQL -> SQL đạt ≥ 40%, Pipeline rolling 7 ngày > 500 triệu.', targetValue: 40, unit: '%' },
      ],
    },
    {
      title: 'Bảo vệ "sinh mệnh" hệ thống và Nâng cấp đột phá trải nghiệm người dùng (UX).',
      keyResults: [
        { title: '[KR 2.1] Giảm thời gian loading do lỗi Proxy xuống dưới 10%.', targetValue: 10, unit: '%' },
        { title: '[KR 2.2] Đạt tỷ lệ chuyển đổi MQL -> PQL là 50%.', targetValue: 50, unit: '%' },
        { title: '[KR 2.3] Rút ngắn Time-to-value (TTV) trung bình xuống 24 giờ.', targetValue: 24, unit: 'hours' },
        { title: '[KR 2.4] Thu thập 100% dữ liệu drop-off trên hành trình UX.', targetValue: 100, unit: '%' },
      ],
    },
    {
      title: 'Xây dựng Brand Trust vững chắc đa nền tảng.',
      keyResults: [
        { title: '[KR 3.1] Tăng Organic Traffic từ Website mới lên 3.000 lượt/tháng.', targetValue: 3000, unit: 'visits/month' },
        { title: '[KR 3.2] Đạt tối thiểu 1 video có 1.000.000 lượt xem tự nhiên.', targetValue: 1, unit: 'video' },
        { title: '[KR 3.3] Đạt 10.000 lượt tương tác/tuần từ Omni Channel.', targetValue: 10000, unit: 'interactions/week' },
      ],
    },
    {
      title: 'Tự động hóa vận hành bằng AI và thiết lập nền móng Go Global.',
      keyResults: [
        { title: '[KR 4.1] 100% (4/4) phòng ban tích hợp ít nhất 01 luồng công việc bằng AI Agent.', targetValue: 100, unit: '%' },
        { title: '[KR 4.2] Lấy thành công huy hiệu "Partner Đối tác chính thức" với Meta.', targetValue: 1, unit: 'badge' },
        { title: '[KR 4.3] Validate thành công 3 thị trường quốc tế có ROI > X%.', targetValue: 3, unit: 'markets' },
      ],
    },
  ];

  // Create L1 Objectives
  const l1Objectives: { id: string; krs: { id: string; title: string }[] }[] = [];
  for (let i = 0; i < l1Data.length; i++) {
    const obj = await prisma.objective.create({
      data: {
        title: l1Data[i].title,
        department: 'BOD',
        progressPercentage: 0,
        ownerId: userMap['dominium'],
        keyResults: {
          create: l1Data[i].keyResults.map((kr) => ({
            title: kr.title,
            progressPercentage: 0,
            currentValue: 0,
            targetValue: kr.targetValue,
            unit: kr.unit,
          })),
        },
      },
      include: { keyResults: true },
    });
    l1Objectives.push({ id: obj.id, krs: obj.keyResults.map((kr) => ({ id: kr.id, title: kr.title })) });
  }
  console.log('✅ Created 4 L1 (BOD) Objectives with 13 KRs');

  // Helper: find L1 KR by partial title match
  const findL1Kr = (searchText: string) => {
    for (const o of l1Objectives) {
      const kr = o.krs.find((k) => k.title.includes(searchText));
      if (kr) return { objId: o.id, krId: kr.id };
    }
    return null;
  };

  // ==============================
  // L2 OBJECTIVES - TECH (Leader: Thái Phong)
  // Aligns to: L1-O2, L1-O1, L1-O4
  // ==============================
  const techL2 = [
    {
      title: 'Khơi thông phễu Onboarding và dọn dẹp triệt để nợ kỹ thuật (Tech Debt).',
      parentObjIdx: 1, // L1-O2
      keyResults: [
        { title: '[Tech KR 1.1] Giảm tỷ lệ lỗi Proxy đầu vào xuống < 10%, sync TKQC lần đầu < 24h.', targetValue: 10, unit: '%', parentKrSearch: 'KR 2.1' },
        { title: '[Tech KR 1.2] Duy trì uptime 99.9% của tối thiểu 03 App Facebook dự phòng.', targetValue: 99.9, unit: '%', parentKrSearch: null },
        { title: '[Tech KR 1.3] Release "Aha Block" + "Liên hệ Sale", rút ngắn TTV xuống 24h.', targetValue: 1, unit: 'release', parentKrSearch: 'KR 2.3' },
        { title: '[Tech KR 1.4] Triển khai In-app Tracking, 100% drop-off data trước 30/5/2026.', targetValue: 100, unit: '%', parentKrSearch: 'KR 2.4' },
      ],
    },
    {
      title: 'Hoàn thiện hệ sinh thái tính năng Agency để đạt Partner Meta và phục vụ Vận hành.',
      parentObjIdx: 0, // L1-O1
      keyResults: [
        { title: '[Tech KR 2.1] Hoàn thiện Quản lý BM, Set Ads, Quản lý Page & Agency Super Share.', targetValue: 1, unit: 'completion', parentKrSearch: null },
        { title: '[Tech KR 2.2] Code và bàn giao S-CRM v2 cho Sale trước 30/05/2026.', targetValue: 1, unit: 'completion', parentKrSearch: 'KR 1.1' },
      ],
    },
    {
      title: 'Làm chủ "AI Dev Cycle" để bứt phá hiệu suất và hệ thống hóa tri thức.',
      parentObjIdx: 3, // L1-O4
      keyResults: [
        { title: '[Tech KR 3.1] Rút ngắn thời gian lên Wireframe xuống < 2 ngày nhờ AI.', targetValue: 2, unit: 'days', parentKrSearch: 'KR 4.1' },
        { title: '[Tech KR 3.2] Giảm tỷ lệ bug khi deploy xuống < 10% nhờ AI Code Review.', targetValue: 10, unit: '%', parentKrSearch: 'KR 4.1' },
        { title: '[Tech KR 3.3] SMIT Wiki AI vận hành, giải quyết >90% câu hỏi nội bộ.', targetValue: 90, unit: '%', parentKrSearch: 'KR 4.1' },
      ],
    },
  ];

  for (const obj of techL2) {
    const parentL1 = l1Objectives[obj.parentObjIdx];
    await prisma.objective.create({
      data: {
        title: obj.title,
        department: 'Tech',
        progressPercentage: 0,
        ownerId: userMap['thaiphong'],
        parentId: parentL1.id,
        keyResults: {
          create: obj.keyResults.map((kr) => {
            const parentKr = kr.parentKrSearch ? findL1Kr(kr.parentKrSearch) : null;
            return {
              title: kr.title,
              progressPercentage: 0,
              currentValue: 0,
              targetValue: kr.targetValue,
              unit: kr.unit,
              parentKrId: parentKr?.krId ?? null,
            };
          }),
        },
      },
    });
  }
  console.log('✅ Created 3 Tech L2 Objectives with 9 KRs');

  // ==============================
  // L2 OBJECTIVES - MARKETING (Leader: Hà Canh)
  // Aligns to: L1-O1, L1-O3, L1-O4
  // ==============================
  const mktL2 = [
    {
      title: 'Tìm ra Winning Content Formula để tạo cỗ máy Lead Gen vô tận.',
      parentObjIdx: 0, // L1-O1
      keyResults: [
        { title: '[Mkt KR 1.1] Mang về 2.000 MQLs, tỷ lệ Signup -> MQL ≥ 50%.', targetValue: 2000, unit: 'MQLs', parentKrSearch: 'KR 1.2' },
        { title: '[Mkt KR 1.2] Tìm ra 03 case quảng cáo Win (CTR ≥ 10%), CPA giảm ≥ 15%.', targetValue: 3, unit: 'cases', parentKrSearch: null },
      ],
    },
    {
      title: 'Xây dựng bộ tiêu chí kiểm thử và Validate thị trường Global.',
      parentObjIdx: 3, // L1-O4
      keyResults: [
        { title: '[Mkt KR 2.1] Validate 3 thị trường Global tiềm năng với ROI > X%.', targetValue: 3, unit: 'markets', parentKrSearch: 'KR 4.3' },
        { title: '[Mkt KR 2.2] Thu hút 100 User Trial từ 3 thị trường để sample test.', targetValue: 100, unit: 'users', parentKrSearch: 'KR 4.3' },
      ],
    },
    {
      title: 'Đóng gói quy trình vận hành Marketing bằng AI AgentOps.',
      parentObjIdx: 3, // L1-O4
      keyResults: [
        { title: '[Mkt KR 3.1] AgentOps (AI Ads) vận hành, tiết kiệm 20% ngân sách rác trước 30/6.', targetValue: 20, unit: '%', parentKrSearch: 'KR 4.1' },
        { title: '[Mkt KR 3.2] Xây dựng AI SEO Blog tự động trước 30/6/2026.', targetValue: 1, unit: 'system', parentKrSearch: 'KR 4.1' },
      ],
    },
  ];

  for (const obj of mktL2) {
    const parentL1 = l1Objectives[obj.parentObjIdx];
    await prisma.objective.create({
      data: {
        title: obj.title,
        department: 'Marketing',
        progressPercentage: 0,
        ownerId: userMap['hacanh'],
        parentId: parentL1.id,
        keyResults: {
          create: obj.keyResults.map((kr) => {
            const parentKr = kr.parentKrSearch ? findL1Kr(kr.parentKrSearch) : null;
            return {
              title: kr.title,
              progressPercentage: 0,
              currentValue: 0,
              targetValue: kr.targetValue,
              unit: kr.unit,
              parentKrId: parentKr?.krId ?? null,
            };
          }),
        },
      },
    });
  }
  console.log('✅ Created 3 Marketing L2 Objectives with 6 KRs');

  // ==============================
  // L2 OBJECTIVES - MEDIA (Leader: Thành Long)
  // Aligns to: L1-O3, L1-O4
  // ==============================
  const mediaL2 = [
    {
      title: 'Tăng cường Brand Awareness thông qua mạng xã hội và nội dung số.',
      parentObjIdx: 2, // L1-O3
      keyResults: [
        { title: '[Media KR 1.1] Đạt 01 video 1M view tự nhiên, tổng Follower đạt 25.000.', targetValue: 1, unit: 'video', parentKrSearch: 'KR 3.2' },
        { title: '[Media KR 1.2] Duy trì Avg View Duration > 50% cho chuỗi 33 video.', targetValue: 50, unit: '%', parentKrSearch: null },
        { title: '[Media KR 1.3] Hồi sinh Group SMIT, tăng trưởng 3.300 Members hoạt động.', targetValue: 3300, unit: 'members', parentKrSearch: 'KR 3.3' },
      ],
    },
    {
      title: 'Biến Media thành "Xưởng sản xuất bằng AI" và hỗ trợ Go Global.',
      parentObjIdx: 3, // L1-O4
      keyResults: [
        { title: '[Media KR 2.1] 100% yêu cầu ấn phẩm hoàn thành đúng deadline (ứng dụng AI).', targetValue: 100, unit: '%', parentKrSearch: 'KR 4.1' },
        { title: '[Media KR 2.2] Hỗ trợ Mkt tài liệu/video test Global đúng deadline 100%.', targetValue: 100, unit: '%', parentKrSearch: 'KR 4.3' },
      ],
    },
  ];

  for (const obj of mediaL2) {
    const parentL1 = l1Objectives[obj.parentObjIdx];
    await prisma.objective.create({
      data: {
        title: obj.title,
        department: 'Media',
        progressPercentage: 0,
        ownerId: userMap['thanhlong'],
        parentId: parentL1.id,
        keyResults: {
          create: obj.keyResults.map((kr) => {
            const parentKr = kr.parentKrSearch ? findL1Kr(kr.parentKrSearch) : null;
            return {
              title: kr.title,
              progressPercentage: 0,
              currentValue: 0,
              targetValue: kr.targetValue,
              unit: kr.unit,
              parentKrId: parentKr?.krId ?? null,
            };
          }),
        },
      },
    });
  }
  console.log('✅ Created 2 Media L2 Objectives with 5 KRs');

  // ==============================
  // L2 OBJECTIVES - SALES (Leader: Nguyễn Quân)
  // Aligns to: L1-O1, L1-O2
  // ==============================
  const salesL2 = [
    {
      title: 'Chuyển hóa tối đa cơ hội thành Doanh thu 4,5 Tỷ và quản trị Data chặt chẽ.',
      parentObjIdx: 0, // L1-O1
      keyResults: [
        { title: '[Sale KR 1.1] Đóng góp trực tiếp đạt 4,5 Tỷ VNĐ tổng doanh thu.', targetValue: 4500000000, unit: 'VND', parentKrSearch: null },
        { title: '[Sale KR 1.2] [INBOUND] MQL -> SQL > 40%, Pipeline (7d) > 500 triệu.', targetValue: 40, unit: '%', parentKrSearch: 'KR 1.3' },
        { title: '[Sale KR 1.3] [OUTBOUND] Đạt ≥ 30% doanh thu từ Sale Hunting tự chủ.', targetValue: 30, unit: '%', parentKrSearch: null },
      ],
    },
    {
      title: 'Tối ưu quy trình nội bộ để rút ngắn Sale Cycle.',
      parentObjIdx: 0, // L1-O1
      keyResults: [
        { title: '[Sale KR 2.1] Rút ngắn Sale Cycle trung bình xuống < 45 ngày.', targetValue: 45, unit: 'days', parentKrSearch: 'KR 1.1' },
        { title: '[Sale KR 2.2] Thiết kế 1 bộ Sale Playbook rút ngắn thời gian demo.', targetValue: 1, unit: 'playbook', parentKrSearch: null },
        { title: '[Sale KR 2.3] Hoàn thiện 100% UI S-CRM v2 trước 30/4/2026.', targetValue: 100, unit: '%', parentKrSearch: 'KR 1.1' },
      ],
    },
  ];

  for (const obj of salesL2) {
    const parentL1 = l1Objectives[obj.parentObjIdx];
    await prisma.objective.create({
      data: {
        title: obj.title,
        department: 'Sale',
        progressPercentage: 0,
        ownerId: userMap['dominium'],
        parentId: parentL1.id,
        keyResults: {
          create: obj.keyResults.map((kr) => {
            const parentKr = kr.parentKrSearch ? findL1Kr(kr.parentKrSearch) : null;
            return {
              title: kr.title,
              progressPercentage: 0,
              currentValue: 0,
              targetValue: kr.targetValue,
              unit: kr.unit,
              parentKrId: parentKr?.krId ?? null,
            };
          }),
        },
      },
    });
  }
  console.log('✅ Created 2 Sales L2 Objectives with 6 KRs');

  // Summary
  console.log('\n🎉 OKRs Q2/2026 seeding complete!');
  console.log('   📊 L1 (Company): 4 Objectives, 13 KRs - Owner: dominium');
  console.log('   💻 Tech: 3 Objectives, 9 KRs - Owner: thaiphong');
  console.log('   📢 Marketing: 3 Objectives, 6 KRs - Owner: hacanh');
  console.log('   🎬 Media: 2 Objectives, 5 KRs - Owner: thanhlong');
  console.log('   🤝 Sales: 2 Objectives, 6 KRs - Owner: dominium');
  console.log('   📈 Total: 14 Objectives, 39 KRs with L1-L2 alignment');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
