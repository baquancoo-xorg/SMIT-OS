import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// User IDs (from DB)
const THAI_PHONG_ID = 'de1c1cbe-df84-4edf-ae4a-8cefd1d9a935'; // Tech leader
const HA_CANH_ID = '1f1feab9-5a59-410d-b2d0-4b42e600cd02'; // Marketing leader
const THANH_LONG_ID = 'c2866949-4833-43c7-bea7-42d3a96cf02b'; // Media leader
const NGUYEN_QUAN_ID = 'bcf275bb-9eb2-4968-9ccc-ebdbc3bbd75e'; // Sale/BOD leader

const WEEK_ENDING = new Date('2026-04-19T00:00:00.000Z');

const techReport = {
  userId: THAI_PHONG_ID,
  weekEnding: WEEK_ENDING,
  confidenceScore: 8,
  status: 'Review',
  progress: JSON.stringify({
    keyResults: [
      {
        krId: 'Tech KR 1.1',
        title: 'Giảm tỷ lệ lỗi Proxy đầu vào xuống dưới 10% và đảm bảo thời gian đồng bộ TKQC lần đầu < 24h.',
        previousProgress: 95,
        currentProgress: 95,
        progressChange: 0,
        activities: [
          'Đã xử lý triệt để và hoàn thành hạng mục giảm tỷ lệ lỗi Proxy.',
        ],
        impact: 'Hệ thống đồng bộ đã ổn định, gỡ bỏ hoàn toàn rào cản về lỗi kết nối cho user mới.',
      },
      {
        krId: 'Tech KR 1.3',
        title: 'Khơi thông phễu Onboarding với "Aha Block" và hệ thống Tracking In-app.',
        previousProgress: 90,
        currentProgress: 95,
        progressChange: 5,
        activities: [
          'Đã deploy tính năng Aha Block lên môi trường staging. Hiện đang chờ QC test.',
          'Tracking In-app: Đang chờ chốt luồng dữ liệu (AARRR) với team Marketing (Tiến độ hạng mục này mới đạt 20%).',
        ],
        impact: 'Sẵn sàng release Aha Block để rút ngắn Time-to-value, nhưng phần Tracking đang bị chậm do chờ luồng từ MKT, ảnh hưởng đến khả năng đo lường phễu.',
      },
      {
        krId: 'Tech KR 2.1',
        title: 'Phát triển tính năng mới: Super Share, Set Ads, Quản lý Page, Quản lý BM.',
        previousProgress: 0,
        currentProgress: 20,
        progressChange: 20,
        activities: [
          'Bắt đầu triển khai code Backend (BE) và Frontend (FE) cho tính năng Quản lý Page và Super Share.',
          'SMIT Chat: Xong 95%, đã deploy lên app, đang xin quyền xét duyệt từ Facebook.',
          'Minh bạch tỷ giá chi tiêu: Đạt 100%, đã deploy production.',
        ],
        impact: 'Tính năng Quản lý Page là "vũ khí" cốt lõi để team Sale chốt Deal Nelly (500 Tỷ), đang được ưu tiên dồn resource.',
      },
    ],
  }),
  plans: JSON.stringify({
    items: [
      { stt: 1, item: '[Feature] SMIT Chat', output: 'Hoàn thiện xin quyền Facebook và Deploy lên Production.', deadline: '2026-04-20' },
      { stt: 2, item: '[Feature] Tracking In-app', output: 'Chốt xong luồng sự kiện tracking với team Marketing để code.', deadline: '2026-04-22' },
      { stt: 3, item: '[Feature] Quản lý Page', output: 'Hoàn thành API Backend cho tính năng Quản lý Page.', deadline: '2026-04-24' },
    ],
  }),
  blockers: JSON.stringify({
    items: [
      {
        difficulty: 'Deal Nelly đang chờ tính năng Quản lý Page. Nguồn lực Tech đang phải gồng gánh cả fix bug lẫn làm feature mới.',
        supportRequest: 'Cần chốt scope (phạm vi) làm MVP (bản thử nghiệm) cho Deal Nelly trước hay làm full feature để tránh quá tải.',
      },
      {
        difficulty: 'AI Code Review đang bị delay.',
        supportRequest: 'Cần PM xác nhận accept delay hay reassign task này cho nhân sự khác.',
      },
    ],
  }),
};

const marketingReport = {
  userId: HA_CANH_ID,
  weekEnding: WEEK_ENDING,
  confidenceScore: 3,
  status: 'Review',
  progress: JSON.stringify({
    keyResults: [
      {
        krId: 'MKT KR 1.1',
        title: 'Bứt phá doanh thu – Mang về tối thiểu 2.000 MQLs với tỷ lệ Signup → MQL ≥ 50%.',
        previousProgress: 15,
        currentProgress: 17,
        progressChange: 2,
        activities: [
          'Tối ưu lại các chiến dịch quảng cáo.',
          'Chạy test các nội dung/hình ảnh mới (UGC/KOL).',
        ],
        impact: '🚨 BÁO ĐỘNG: Tỷ lệ chuyển đổi từ Signup -> MQL đang giảm sốc từ 47.4% xuống chỉ còn 16.9%. Tốc độ tạo lead đang rất chậm (tiến độ mới đạt 17% / Target 2000 MQL).',
      },
    ],
  }),
  plans: JSON.stringify({
    items: [
      { stt: 1, item: '[Campaign] Ad Creatives mới', output: 'Hoàn thành video ads còn lại + triển khai 10-15 post mới chủ đề lợi ích.', deadline: '2026-04-22' },
      { stt: 2, item: '[Web] Landing Page', output: 'Gửi wireframe 5 Landing Page cho đội thiết kế / Ladipage.', deadline: '2026-04-23' },
      { stt: 3, item: '[Data] Tracking In-app', output: 'Gửi tài liệu khung Tracking in-app & Retargeting (AARRR) cho đội Dev.', deadline: 'Pending' },
      { stt: 4, item: '[Campaign] KOC/UGC', output: 'Quyết định chính thức: tiếp tục chờ KOC hay chuyển sang tự sản xuất nội dung.', deadline: 'Pending' },
      { stt: 5, item: '[Campaign] Scale case tốt', output: 'Tiếp tục scale ngân sách cho chủ đề SMIT Shield. A/B test biến thể mới.', deadline: '2026-04-25' },
    ],
  }),
  blockers: JSON.stringify({
    items: [
      {
        difficulty: 'MQL rate giảm cực mạnh (từ 47.4% xuống 16.9%). Chất lượng lead đầu vào thay đổi khi tối ưu nội dung hoặc quy trình qualify đang có vấn đề.',
        supportRequest: 'Cần PM và team Sale tham gia review lại tiêu chí MQL và luồng qualify lead gấp.',
      },
      {
        difficulty: 'Nhiều cam kết tuần trước đang bị PENDING. Luồng Tracking In-app và Tracking Website đang bị kẹt tiến độ 0% do phụ thuộc vào đội Tech.',
        supportRequest: 'PM cần làm việc với Tech để chốt timeline cứng cho việc đẩy code website và cài tracking.',
      },
    ],
  }),
};

const mediaReport = {
  userId: THANH_LONG_ID,
  weekEnding: WEEK_ENDING,
  confidenceScore: 7,
  status: 'Review',
  progress: JSON.stringify({
    keyResults: [
      {
        krId: 'Media KR 1.1',
        title: 'Đạt tối thiểu 01 video 1.000.000 lượt xem tự nhiên, đẩy tổng lượng Follower các kênh đạt ngưỡng 25.000.',
        previousProgress: 10,
        currentProgress: 15,
        progressChange: 5,
        activities: [
          'Đã bắt đầu on-air 5 nội dung liên quan đến văn hóa văn phòng (Tỷ lệ trung bình 1.250 lượt views).',
          'Hoàn thành quay 5 nội dung mới, backup sẵn sàng cho dịp nghỉ lễ.',
        ],
        impact: 'Đã bắt đầu phủ thương hiệu SMIT trên nền tảng TikTok. Tuy nhiên, lượt xem organic trên Youtube đang rất thấp, thậm chí không có.',
      },
      {
        krId: 'Media KR 1.2',
        title: 'Dự án TVC (Sự kiện).',
        previousProgress: 60,
        currentProgress: 100,
        progressChange: 40,
        activities: [
          'Đã hoàn thành các hạng mục quay.',
        ],
        impact: 'Đạt 100% việc chuẩn bị source. Tuy nhiên khâu hậu kỳ đang gặp rào cản lớn với Marketing.',
      },
    ],
  }),
  plans: JSON.stringify({
    items: [
      { stt: 1, item: '[Content] Kênh Social', output: 'Duy trì đăng video hàng ngày. Thử nghiệm đẩy luồng link từ sản phẩm sang Youtube.', deadline: '2026-04-25' },
      { stt: 2, item: '[Community] Group Facebook', output: 'Triển khai seeding và kế hoạch book KOC/Group kéo member.', deadline: '2026-04-24' },
    ],
  }),
  blockers: JSON.stringify({
    items: [
      {
        difficulty: 'SLA làm việc với Marketing đang bị vỡ. Thời gian từ lúc Brief đến lúc ra Demo mất quá nhiều thời gian, sau đó MKT thay đổi hoàn toàn nội dung/hình ảnh khiến team Media/Design phải đập đi làm lại từ đầu (đặc biệt là TVC đang tốn quá nhiều công sức).',
        supportRequest: 'Yêu cầu duyệt Brief kỹ từ đầu và có báo cáo ngày để PM/Leader kịp thời xử lý, tránh tình trạng ra sản phẩm mới đập đi.',
      },
      {
        difficulty: 'View organic trên Youtube quá thấp, tương tác Group cộng đồng đang ở mức báo động.',
        supportRequest: 'Cần MKT hỗ trợ book các Group/KOC để seeding nội dung kéo member.',
      },
    ],
  }),
};

const saleReport = {
  userId: NGUYEN_QUAN_ID,
  weekEnding: WEEK_ENDING,
  confidenceScore: 9,
  status: 'Review',
  progress: JSON.stringify({
    keyResults: [
      {
        krId: 'Sale KR 1.1',
        title: 'Trực tiếp đóng góp doanh thu 4.5 tỷ (Doanh thu chủ động chiếm 30%).',
        previousProgress: 0,
        currentProgress: 2,
        progressChange: 2,
        activities: [
          'Trực Page hỗ trợ khách hàng (Tổng 3 bạn đã xử lý 87 lượt chat).',
          'Bám sát các Deal lớn: Trust Mind (Cơ hội Upsell 80 tỷ/tháng - đang review).',
          'Nguyễn Nhung chốt PINK Agency 14.2M & Zee Awan 9.36M trong tuần.',
        ],
        impact: 'Dòng tiền vẫn đang vào, cơ hội Deal Trust Mind rất sáng. Tuy nhiên, Deal khủng Nelly (500 Tỷ) đang bị "nguội" do chờ tính năng từ Tech.',
      },
      {
        krId: 'Sale KR 1.2',
        title: 'Đảm bảo tỷ lệ chuyển đổi SQL / Sign up > 50% và Tái kích hoạt Lead.',
        previousProgress: 0,
        currentProgress: 0,
        progressChange: 0,
        activities: [
          'Khai thác lead cũ và lead mới (Linh gửi 100 kết bạn, đồng ý 30; Huệ tìm kiếm 30 sub/ngày).',
          'Hỗ trợ giải đáp các thắc mắc (Đa phần là lỗi từ khách hàng dùng sản phẩm cũ Ads Check).',
        ],
        impact: '🚨 BÁO ĐỘNG ĐỎ: Kim Huệ 3.85%, Nguyễn Nhung 3.5%, Phương Linh 0%. Chất lượng lead có vấn đề - quá nhiều khách đăng ký nhầm Ads Check. Lead tồn 92 subs (Linh 57, Nhung 18, Huệ 17).',
      },
    ],
  }),
  plans: JSON.stringify({
    items: [
      { stt: 1, item: '[Deal] Chốt Trust Mind', output: 'Duy trì tiến độ review hợp đồng, Upsell/Cross sell để lấy 80 tỷ/tháng.', deadline: '2026-04-25' },
      { stt: 2, item: '[Task] Xử lý Lead Tồn', output: 'Dọn sạch 92 lead tồn trên S-CRM. Tập trung phân loại và Nurturing 35 lead nước ngoài.', deadline: '2026-04-22' },
      { stt: 3, item: '[Task] Đẩy mạnh SQL', output: 'Tăng cường Spam tin nhắn Zalo, Facebook cá nhân để lọc khách có nhu cầu thực.', deadline: '2026-04-25' },
    ],
  }),
  blockers: JSON.stringify({
    items: [
      {
        difficulty: 'Team Sale đang "chết đuối" vì lead rác và lỗi Ads Check. Quá nhiều user Ads Check đăng ký nhầm SMIT Agency, gây tốn thời gian trực chat, làm giảm phễu tỷ lệ MQL > SQL.',
        supportRequest: 'Marketing phải lọc lại luồng đăng ký. Cần tách biệt rõ ràng giữa Ads Check và SMIT Agency để tránh nhiễu loạn phễu Sales.',
      },
      {
        difficulty: 'Deal Nelly (500 Tỷ) đang "nguội".',
        supportRequest: 'PM cần thúc ép Tech triển khai sớm "Quản lý Page" làm MVP để đưa khách dùng thử. Tình trạng này kéo dài Sale sẽ bị mất uy tín với khách.',
      },
    ],
  }),
};

async function main() {
  console.log('Seeding Weekly Reports - Tuần 2 Sprint 2 (13/04 - 19/04/2026)...');

  // Check for existing reports to avoid duplicates
  const existing = await prisma.weeklyReport.findMany({
    where: {
      weekEnding: WEEK_ENDING,
      userId: { in: [THAI_PHONG_ID, HA_CANH_ID, THANH_LONG_ID, NGUYEN_QUAN_ID] },
    },
    select: { userId: true },
  });

  const existingUserIds = new Set(existing.map((r) => r.userId));

  const reports = [techReport, marketingReport, mediaReport, saleReport].filter(
    (r) => !existingUserIds.has(r.userId),
  );

  if (reports.length === 0) {
    console.log('All reports already exist for this week. Skipping.');
    return;
  }

  const result = await prisma.weeklyReport.createMany({ data: reports });
  console.log(`✓ Inserted ${result.count} reports.`);

  if (existingUserIds.size > 0) {
    console.log(`⚠ Skipped ${existingUserIds.size} already-existing reports.`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
