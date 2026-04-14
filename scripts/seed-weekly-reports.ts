import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Weekly report data extracted from markdown files
// Structure: { team, weekEnding, leaderName, confidenceScore, progress, plans, blockers, score }

const weeklyReportsData = [
  // ==================== TUẦN 1 - SPRINT 1 (23/03 - 29/03/2026) ====================
  {
    team: 'Tech',
    weekEnding: '2026-03-29',
    leaderName: 'Thái Phong',
    confidenceScore: 9,
    score: 8,
    progress: JSON.stringify({
      keyResults: [
        {
          krId: 'KR 1.1',
          title: 'Giảm tỷ lệ lỗi Proxy đầu vào xuống dưới 10% và đảm bảo thời gian đồng bộ TKQC lần đầu < 24h',
          previousProgress: 0,
          currentProgress: 50,
          progressChange: 50,
          activities: [
            'Tối ưu phía FE để xử lý triệt để lỗi Proxy đầu vào.',
            'Xử lý chia nhỏ các file JS (do dung lượng sau build quá lớn khiến máy cấu hình thấp load chậm).',
            'Chuyển đổi định dạng các file ảnh PNG nặng sang định dạng WebP tối ưu hơn.'
          ],
          impact: 'Giải quyết dứt điểm tình trạng khách hàng rớt mạng ở màn hình chờ đầu tiên. Lỗi load trang đã giảm mạnh xuống mức <10% theo đúng mục tiêu.'
        },
        {
          krId: 'KR 1.2',
          title: 'Xin cấp quyền và duy trì trạng thái uptime 99.9% của tối thiểu 03 App Facebook dự phòng',
          previousProgress: 0,
          currentProgress: 25,
          progressChange: 25,
          activities: [
            'Gửi form xin cấp quyền lần 2 (từ thứ 7 ngày 22/03) cho 4 App Facebook dự phòng.',
            'Theo dõi trạng thái duyệt của Meta.'
          ],
          impact: 'Khởi tạo hạ tầng backup phòng ngừa rủi ro sập luồng đồng bộ tài khoản nếu App chính bị Meta khóa.'
        },
        {
          krId: 'KR 1.4',
          title: 'Triển khai In-app Tracking thành công, ghi nhận đủ 100% dữ liệu drop-off trả về Dashboard',
          previousProgress: 0,
          currentProgress: 40,
          progressChange: 40,
          activities: [
            'Đã đấu nối thành công PostHog vào hệ thống Front-End.',
            'Bật và theo dõi được các chỉ số web cùng tính năng Replay Session (xem lại thao tác user).'
          ],
          impact: 'Cung cấp số liệu và hình ảnh thực tế về luồng Onboarding của khách hàng để team Sale và MKT nắm bắt được hành vi rớt phễu.'
        }
      ]
    }),
    plans: JSON.stringify({
      items: [
        { stt: 1, item: '[TechTask] Xin quyền App FB v1 & v2', output: 'Gửi video review và nhận quyền Ads Standard cho 2 app đầu.', deadline: '2026-04-01' },
        { stt: 2, item: '[TechTask] Xin quyền App FB v3 & v4', output: 'Gửi xin quyền cách ngày cho 2 app còn lại để tránh bot Meta nghi ngờ.', deadline: '2026-04-03' },
        { stt: 3, item: '[TechTask] Tối ưu In-app Tracking', output: 'Bổ sung logic tracking để phân biệt được lỗi rớt mạng do server hay do mạng của khách hàng.', deadline: '2026-04-04' }
      ]
    }),
    blockers: JSON.stringify({
      items: [
        {
          difficulty: 'Hệ thống Tracking (PostHog) mới gắn vào chưa bóc tách cụ thể được trường hợp người dùng bị lỗi load trang là do thiết bị/mạng của họ hay do hệ thống của mình.',
          supportRequest: 'Không có. (Team Tech sẽ tự research và fix phần bắt lỗi này trong tuần tới).'
        }
      ]
    })
  },
  {
    team: 'Marketing',
    weekEnding: '2026-03-29',
    leaderName: 'Hà Canh',
    confidenceScore: 8,
    score: 7,
    progress: JSON.stringify({
      keyResults: [
        {
          krId: 'KR 1.2',
          title: 'Tìm ra tối thiểu 03 case quảng cáo Win (CTR ≥ 10%), kéo CPA trung bình giảm ≥ 15% so với Q1',
          previousProgress: 0,
          currentProgress: 30,
          progressChange: 30,
          activities: [
            'Rà soát toàn bộ chiến dịch Facebook Ads do nội dung cũ đang bị giảm hiệu quả.',
            'Hoàn thành tái cơ cấu chiến dịch: Tạo lại creative mới và tập trung dồn ngân sách vào các nhóm quảng cáo còn duy trì được hiệu quả.',
            'Đã lên tạm ứng ngân sách và chờ duyệt giải ngân cho kỳ quảng cáo 28/03 - 12/04.'
          ],
          impact: 'Dừng kịp thời việc "chảy máu" ngân sách vào các ads rác. Khung chiến dịch Q2 đã được định hình rõ ràng, tạo bước đệm vững chắc để test các case Win trong tuần tới.'
        },
        {
          krId: 'KR 1.1',
          title: 'Mang về 2.000 MQLs với tỷ lệ chuyển đổi MQL -> Signup duy trì ở mức tối thiểu 50%',
          previousProgress: 0,
          currentProgress: 15,
          progressChange: 15,
          activities: [
            'Hoàn thành xây dựng hạ tầng chuẩn bị cho chiến dịch UGC Review (Bao gồm hệ thống bảng quản lý và file Brief chi tiết).'
          ],
          impact: 'Đã xây xong móng, chuẩn bị sẵn sàng vũ khí để bắt đầu khâu Outreach (liên hệ) các Creator/KOC nhằm tạo phễu thu Lead số lượng lớn.'
        }
      ]
    }),
    plans: JSON.stringify({
      items: [
        { stt: 1, item: '[Campaign] Chiến dịch Facebook Ads', output: 'Nhận giải ngân và kích hoạt lại các chiến dịch đã tái cơ cấu để duy trì luồng Lead.', deadline: '2026-03-31' },
        { stt: 2, item: '[MktTask] Chiến dịch UGC Review', output: 'Hoàn thiện Brief chi tiết để bàn giao cho team Media và bắt đầu quá trình Outreach KOC.', deadline: '2026-04-02' },
        { stt: 3, item: '[MktTask] Setup Tracking hệ thống', output: 'Thúc đẩy team Design/Tech chốt khung Website, phục vụ gắn mã Tracking (GA4, Pixel).', deadline: '2026-04-05' }
      ]
    }),
    blockers: JSON.stringify({
      items: [
        {
          difficulty: 'Website chính của hệ thống chưa hoàn thiện việc index và chưa có khung chuẩn, gây khó khăn và đình trệ hoàn toàn việc setup hệ thống Tracking đo lường luồng User.',
          supportRequest: 'Yêu cầu PM điều phối đội Tech & Product khẩn trương chốt hạ tầng web sớm để MKT có thể gắn mã tracking (GA4/Pixel) chuẩn bị cho các chiến dịch đổ traffic sắp tới.'
        }
      ]
    })
  },
  {
    team: 'Media',
    weekEnding: '2026-03-29',
    leaderName: 'Thành Long',
    confidenceScore: 8,
    score: 7,
    progress: JSON.stringify({
      keyResults: [
        {
          krId: 'KR 1.1',
          title: 'Đạt tối thiểu 01 video 1.000.000 views trên TikTok/Shorts (Dự án TVC Sự kiện)',
          previousProgress: 0,
          currentProgress: 20,
          progressChange: 20,
          activities: [
            'Bắt tay vào giai đoạn Tiền kỳ (Pre-production).',
            'Họp team và đã chốt xong Concept/Ý tưởng kịch bản cho dự án TVC Sự kiện trọng điểm của tháng tới.'
          ],
          impact: 'Đã định hình được nội dung chủ đạo, tạo nền móng vững chắc chuẩn bị cho giai đoạn quay dựng.'
        },
        {
          krId: 'KR 2.2',
          title: 'Ứng dụng AI Agent giúp tăng [Y] lần số lượng ấn phẩm phát hành mỗi tuần mà không tăng nhân sự',
          previousProgress: 0,
          currentProgress: 50,
          progressChange: 50,
          activities: [
            'Đã lên danh sách, trình duyệt và được PM thông qua ngân sách (1.619.000đ) cho các phần mềm công cụ: VidIQ, CapCut Pro và Weavy AI.',
            'Đang tiến hành thanh toán và kích hoạt tài khoản cho anh em trong đội.'
          ],
          impact: 'Sẵn sàng hạ tầng công cụ quan trọng. Việc có CapCut Pro và AI sẽ giúp rút ngắn 70% thời gian hậu kỳ, biến Media thành "Xưởng sản xuất" đúng nghĩa trong các Sprint tới.'
        },
        {
          krId: 'KR 2.1',
          title: 'Đảm bảo SLA: 100% các yêu cầu ấn phẩm (Video Onboarding, Layout PDF Sale, Ads Creative) được hoàn thành đúng deadline',
          previousProgress: 0,
          currentProgress: 0,
          progressChange: 0,
          activities: [
            'Setup xong máy móc thiết bị, sẵn sàng nhân sự để quay dựng đợt 1 các Video Quảng cáo (UGC, Case Study).',
            'Tuy nhiên hiện tại chưa bắt đầu làm được vì chưa có đầu vào.'
          ],
          impact: 'Chưa có tác động vì Team đang trong trạng thái chờ (Standby).'
        }
      ]
    }),
    plans: JSON.stringify({
      items: [
        { stt: 1, item: '[MediaTask] Công cụ AI hậu kỳ', output: 'Hoàn tất mua sắm và bàn giao 100% tài khoản công cụ AI cho anh em trong đội sử dụng.', deadline: '2026-03-31' },
        { stt: 2, item: '[MediaTask] Dự án TVC Sự kiện', output: 'Tiến hành quay dựng và xuất bản Demo Ver 1 của TVC Sự kiện để PM duyệt.', deadline: '2026-04-04' },
        { stt: 3, item: '[MediaTask] Ấn phẩm Performance Ads', output: 'Nhận Brief UGC từ Marketing, lập tức triển khai tiền kỳ (tìm KOC, setup bối cảnh).', deadline: '2026-04-05' }
      ]
    }),
    blockers: JSON.stringify({
      items: [
        {
          difficulty: 'Team Media đang bị trống việc ở mảng sản xuất Video Ads chuyển đổi. Trạng thái task hiện tại là "Chưa bắt đầu" do chưa nhận được Brief Kịch bản chi tiết & Yêu cầu sản xuất đợt 1 từ phòng Marketing.',
          supportRequest: 'Cần PM hối thúc phòng Marketing (Hà Canh) khẩn trương chốt và bàn giao Brief sang cho Media trong đầu tuần tới để Media kịp quay dựng luồng chạy ra Lead đầu tháng 4.'
        }
      ]
    })
  },
  {
    team: 'Sale',
    weekEnding: '2026-03-29',
    leaderName: 'Nguyễn Quân',
    confidenceScore: 8,
    score: 8,
    progress: JSON.stringify({
      keyResults: [
        {
          krId: 'KR 1.2',
          title: '[INBOUND] Chuyển đổi MQL -> SQL đạt >40% và duy trì tổng giá trị Pipeline (7 ngày) luôn > 500 triệu đồng',
          previousProgress: 0,
          currentProgress: 20,
          progressChange: 20,
          activities: [
            'Rà soát và xử lý thành công 70% data khách hàng mới/tồn đọng trên S-CRM từ sau đợt Tết.',
            'Phân loại được tệp data rác (ấn nhầm từ Adscheck sang) và tệp khách hàng tiềm năng thực sự để chăm sóc (Care page, nhắn tin Zalo).'
          ],
          impact: 'Dọn dẹp sạch sẽ phễu Inbound cũ, bảo vệ các Lead chất lượng không bị rơi rớt. Giữ cho chỉ số Pipeline luôn ở mức an toàn.'
        },
        {
          krId: 'KR 1.1',
          title: 'Đóng góp trực tiếp đạt 4,5 Tỷ VNĐ tổng doanh thu toàn dự án',
          previousProgress: 0,
          currentProgress: 10,
          progressChange: 10,
          activities: [
            'Tiếp cận, tiến hành Demo hệ thống và hướng dẫn dùng thử cho các khách hàng VIP:',
            '  - Anh Đức Anh Lê: Gói ngân sách 10 tỷ (All in One).',
            '  - Anh Khương Lê: Gói ngân sách 13 tỷ (All in One).',
            'Xử lý và Demo các yêu cầu custom thêm cho Deal Nelly (Khách hàng cực lớn).'
          ],
          impact: 'Tạo ra các cơ hội bán hàng (Opportunities) với giá trị khổng lồ. Dù chưa chốt thành doanh thu thực tế nhưng đây là tiền đề cực kỳ quan trọng để kích nổ doanh thu 4.5 Tỷ trong các tuần tiếp theo.'
        },
        {
          krId: 'KR 1.3',
          title: '[OUTBOUND]: Đạt tối thiểu 30% doanh thu từ nguồn Sale tự chủ động tìm kiếm (Hunting) không phụ thuộc vào Marketing (so với doanh thu tổng 4,5 tỷ)',
          previousProgress: 0,
          currentProgress: 15,
          progressChange: 15,
          activities: [
            'Ứng dụng AI: AE Nguyễn Nhung đã xây dựng hoàn thiện Gem AI hỗ trợ viết bài, soạn mail và dịch ngôn ngữ.',
            'Lọc danh sách tệp khách hàng cũ đang dùng tốt để chuẩn bị gọi xin Referral (Cu2Cu).'
          ],
          impact: 'Chuẩn bị xong "vũ khí" (Gem AI và data) để đánh tệp khách hàng ngoại quốc (trên diễn đàn BlackHatWorld) và khai thác mạng lưới giới thiệu ngay trong tuần tới.'
        }
      ]
    }),
    plans: JSON.stringify({
      items: [
        { stt: 1, item: '[Deal] Đàm phán Khách hàng Nelly', output: 'Có câu trả lời dứt điểm về các yêu cầu custom để đưa khách vào giai đoạn thương lượng/chốt Hợp đồng.', deadline: '2026-04-02' },
        { stt: 2, item: '[Deal] Chăm sóc KH Khương Lê & Đức Anh Lê', output: 'Follow up sát quá trình khách tự test hệ thống, xử lý phản hồi để chốt deal.', deadline: '2026-04-04' },
        { stt: 3, item: '[SaleTask] Khai thác mạng lưới Referral', output: 'Gọi điện kịch bản Cu2Cu cho tệp khách hàng cũ đang hoạt động tốt.', deadline: '2026-04-03' },
        { stt: 4, item: '[SaleTask] Outbound & Social Selling', output: 'Đẩy mạnh tương tác profile Facebook, tiếp cận nguồn khách mới trên Zalo và BlackHatWorld.', deadline: '2026-04-05' }
      ]
    }),
    blockers: JSON.stringify({
      items: [
        {
          difficulty: 'Deal "cá mập" Nelly đang bị khựng lại ở khâu đàm phán do khách có yêu cầu test thêm tính năng custom và phản hồi. Hiện tại Sale vẫn đang phải chờ đội Tech.',
          supportRequest: 'Yêu cầu Tech Leader (Thái Phong) ưu tiên test nốt các tính năng khách Nelly yêu cầu ngay trong ngày Thứ 2 tuần tới và feedback lại để Sale có cơ sở ép khách chốt deal.'
        }
      ]
    })
  },

  // ==================== TUẦN 2 - SPRINT 1 (30/03 - 05/04/2026) ====================
  {
    team: 'Tech',
    weekEnding: '2026-04-05',
    leaderName: 'Thái Phong',
    confidenceScore: 8,
    score: 8,
    progress: JSON.stringify({
      keyResults: [
        {
          krId: 'KR 1.1',
          title: 'Giảm tỷ lệ lỗi Proxy đầu vào xuống dưới 10% và đảm bảo thời gian đồng bộ TKQC lần đầu < 24h',
          previousProgress: 50,
          currentProgress: 70,
          progressChange: 20,
          activities: [
            'Xử lý triệt để 100% các trường hợp lỗi Proxy xuất phát từ phía Server của SMIT.'
          ],
          impact: 'Đã gỡ được "nút thắt" lớn nhất của hệ thống. Hiện tại rủi ro rớt mạng chỉ còn nằm ở các trường hợp user sử dụng mạng lưới quá yếu. Hệ thống cơ bản đã đạt mức độ ổn định.'
        },
        {
          krId: 'KR 1.2',
          title: 'Xin cấp quyền và duy trì trạng thái uptime 99.9% của tối thiểu 03 App Facebook dự phòng',
          previousProgress: 25,
          currentProgress: 50,
          progressChange: 25,
          activities: [
            'Xin thành công quyền Ads Standard cho App v1.',
            'Xin quyền page_metadata cho App v1 và gửi video xin quyền cho App v2.',
            'Chuẩn bị làm video xin quyền cho App v3 và v4.'
          ],
          impact: 'Quy trình xin cấp quyền đang được thực hiện nhỏ giọt, rải rác đúng chiến thuật để đảm bảo tỷ lệ duyệt của Meta và tránh bị đánh dấu spam.'
        },
        {
          krId: 'KR 1.3',
          title: 'Release "Aha Block" và nút "Liên hệ Sale trực tiếp", đóng góp vào việc rút ngắn Time-to-value xuống 24h',
          previousProgress: 0,
          currentProgress: 80,
          progressChange: 80,
          activities: [
            'Code xong 100% UI và Logic API cho "Aha Block".',
            'Đã Pass QA nội bộ (Môi trường Staging). Chỉ chờ Review cuối để Deploy.'
          ],
          impact: 'Sẵn sàng đưa tính năng core lên môi trường thật, đóng góp trực tiếp vào mục tiêu tối ưu trải nghiệm Onboarding và giảm Time-To-Value cho user mới.'
        },
        {
          krId: 'KR 1.4',
          title: 'Triển khai In-app Tracking thành công, ghi nhận đủ 100% dữ liệu drop-off trả về Dashboard',
          previousProgress: 40,
          currentProgress: 50,
          progressChange: 10,
          activities: [
            'Cập nhật thêm cơ chế Debug phía hệ thống cho PostHog.',
            'Liên kết với đội MKT để lên danh sách các Event User cần tracking.'
          ],
          impact: 'Hạ tầng tracking đã sẵn sàng. Tuy nhiên tiến độ tăng chậm do đang phải đợi chốt luồng UX từ phía Marketing mới có thể gắn event thực tế vào code.'
        },
        {
          krId: 'KR 2.2',
          title: 'Code và bàn giao thành công nền tảng S-CRM v2 (Dashboard, Metric Realtime) cho đội Sale',
          previousProgress: 0,
          currentProgress: 80,
          progressChange: 80,
          activities: [
            'Hoàn thiện 80% logic và giao diện của module SMIT Chat.',
            'Chỉ còn phần test các case sử dụng.'
          ],
          impact: 'Bám sát tiến độ cam kết. Module Chat là tiền đề vô cùng quan trọng để tích hợp S-CRM v2.'
        }
      ]
    }),
    plans: JSON.stringify({
      items: [
        { stt: 1, item: '[Epic] Tính năng Aha Block', output: 'Tiến hành Code Review cuối (Chủ Nhật) và Deploy chính thức lên Production.', deadline: '2026-04-06' },
        { stt: 2, item: '[Epic] Module SMIT Chat', output: 'Cập nhật bản MVP (Chiều T3). Hoàn thiện 100% cả trải nghiệm lẫn logic.', deadline: '2026-04-09' },
        { stt: 3, item: '[TechTask] Quản lý Page & Tỷ giá', output: 'Cắt giao diện (HTML/CSS) và bắt đầu đấu nối API cho tính năng.', deadline: '2026-04-11' },
        { stt: 4, item: '[TechTask] Xin quyền App FB', output: 'Tiếp tục follow và gửi yêu cầu cấp quyền cho các App v3, v4.', deadline: '2026-04-11' }
      ]
    }),
    blockers: JSON.stringify({
      items: [
        {
          difficulty: 'Tính năng Tracking Event cho người dùng hiện đang bị kẹt do chưa có luồng Landing Page và Onboarding chi tiết.',
          supportRequest: 'Yêu cầu đội MKT (Hà Canh) khẩn trương chốt luồng UI/UX để Tech có cơ sở gắn mã Tracking Event. Cần PM (Quân) thúc đẩy.'
        }
      ]
    })
  },
  {
    team: 'Marketing',
    weekEnding: '2026-04-05',
    leaderName: 'Hà Canh',
    confidenceScore: 6,
    score: 6,
    progress: JSON.stringify({
      keyResults: [
        {
          krId: 'KR 1.2',
          title: 'Tìm ra tối thiểu 03 case quảng cáo Win (CTR ≥ 10%), kéo CPA trung bình giảm ≥ 15% so với Q1',
          previousProgress: 30,
          currentProgress: 45,
          progressChange: 15,
          activities: [
            'Hoàn thành rà soát và tái cơ cấu toàn bộ nội dung quảng cáo Facebook đang chạy.',
            'Phân bổ lại ngân sách theo hiệu quả từng nhóm quảng cáo, loại bỏ dứt điểm các ads rác.',
            'Đã xác định được 3 case nội dung Win mang lại CPA ổn định trong khoảng 120K - 150K.'
          ],
          impact: 'Mục tiêu tìm Case Win đang đi đúng hướng (Đạt 45%). Việc giữ vững được 3 case này giúp kiểm soát CPA an toàn và là cơ sở để vít ngân sách trong các tuần tiếp theo.'
        },
        {
          krId: 'KR 1.1',
          title: 'Mang về 2.000 MQLs với tỷ lệ chuyển đổi MQL -> Signup duy trì ở mức tối thiểu 50%',
          previousProgress: 15,
          currentProgress: 38,
          progressChange: 23,
          activities: [
            'Chạy duy trì các chiến dịch thu Lead bằng các mẫu nội dung cũ và 3 case Win vừa tìm được.',
            'Các luồng mới như chiến dịch UGC (KOC) và Retargeting vẫn đang ở giai đoạn đầu, chưa bung được số.'
          ],
          impact: 'Rủi ro lớn: MQL hiện tại mới đạt mốc 38% (Chưa đạt kỳ vọng 50% theo tiến độ thời gian). Nếu không ép tiến độ luồng UGC và Retargeting, mục tiêu 2.000 MQLs của Quý sẽ bị vỡ.'
        },
        {
          krId: 'KR 2.1',
          title: 'Validate thành công 3 thị trường Global tiềm năng với mức ROI > [X]%',
          previousProgress: 0,
          currentProgress: 20,
          progressChange: 20,
          activities: [
            'Đã hoàn thiện xong bảng Dự toán ngân sách cho chiến dịch Test thị trường nước ngoài.'
          ],
          impact: 'Tiến độ đang chậm. Đã có dự toán nhưng vẫn chưa thể viết xong kế hoạch/brief chi tiết để triển khai thực tế. Cần tập trung giải quyết trong tuần sau.'
        }
      ]
    }),
    plans: JSON.stringify({
      items: [
        { stt: 1, item: '[MktTask] Chốt luồng UI/UX Website', output: 'Hoàn thiện và chuẩn bị kỹ tài liệu (Tracking, CRO) để họp chốt dứt điểm khung Website với team Tech.', deadline: '2026-04-08' },
        { stt: 2, item: '[Campaign] Chiến dịch UGC (KOC)', output: 'Đẩy nhanh tiến độ booking KOC để sớm có video nguyên liệu đổ luồng Lead mới, bù đắp chỉ số MQL đang thiếu.', deadline: '2026-04-09' },
        { stt: 3, item: '[MktTask] Kế hoạch Test Global', output: 'Hoàn thiện bản kế hoạch chi tiết (Brief) và phương án test 3 thị trường Quốc tế.', deadline: '2026-04-11' }
      ]
    }),
    blockers: JSON.stringify({
      items: [
        {
          difficulty: 'Tiến độ tối ưu Web & Tracking khách hàng (Thuộc O2) đang ở mức 0% (Chậm tiến độ nghiêm trọng). Toàn bộ các luồng cài cắm đo lường đang phụ thuộc hoàn toàn vào việc chốt khung Website SMIT.',
          supportRequest: 'Cuộc họp ngày 08/04 với đội Tech & Product là Critical Path (Đường găng). Nếu trễ hoặc không chốt được khung Website trong buổi họp này, toàn bộ mục tiêu Tracking của Tháng 4 sẽ bị delay. Yêu cầu PM trực tiếp điều phối và ép deadline đội Tech (Thái Phong/Đăng Khoa).'
        }
      ]
    })
  },
  {
    team: 'Media',
    weekEnding: '2026-04-05',
    leaderName: 'Thành Long',
    confidenceScore: 7,
    score: 7,
    progress: JSON.stringify({
      keyResults: [
        {
          krId: 'KR 1.1',
          title: 'Đạt tối thiểu 01 video 1.000.000 views trên TikTok/Shorts (Dự án TVC Sự kiện)',
          previousProgress: 20,
          currentProgress: 60,
          progressChange: 40,
          activities: [
            'Hoàn thành toàn bộ khâu Tiền kỳ và Quay phim (Production) cho dự án TVC Sự kiện.',
            'Hoàn thành xuất bản bản dựng nháp (Demo Ver 1) để PM và các team cùng xem qua.'
          ],
          impact: 'Dự án "đinh" của tháng đã thành hình, vượt qua được giai đoạn tốn kém và vất vả nhất là quay phim. Đang bám sát timeline dự kiến dù khâu hậu kỳ gặp chút rắc rối.'
        },
        {
          krId: 'KR 2.2',
          title: 'Ứng dụng AI Agent giúp tăng [Y] lần số lượng ấn phẩm phát hành mỗi tuần mà không tăng nhân sự',
          previousProgress: 50,
          currentProgress: 100,
          progressChange: 50,
          activities: [
            'Hoàn tất quá trình thanh toán, nâng cấp và bàn giao 100% tài khoản công cụ AI (VidIQ, CapCut Pro, Weavy AI) cho anh em trong đội.',
            'Lên rule (quy tắc) sử dụng chung cho cả đội khi làm hậu kỳ.'
          ],
          impact: 'Hạ tầng công cụ AI đã sẵn sàng 100%. Ngay lập tức áp dụng CapCut Pro vào việc hậu kỳ TVC giúp các Editor xử lý hiệu ứng nhanh hơn đáng kể.'
        },
        {
          krId: 'KR 2.1',
          title: 'Đảm bảo SLA: 100% các yêu cầu ấn phẩm (Video Onboarding, Layout PDF Sale, Ads Creative) được hoàn thành đúng deadline',
          previousProgress: 0,
          currentProgress: 0,
          progressChange: 0,
          activities: [
            'Tiếp tục Standby (Chờ đợi) để quay dựng đợt 1 Video UGC/Case Study quảng cáo.'
          ],
          impact: 'Team Media đã chuẩn bị sẵn sàng nguồn lực máy móc, con người nhưng vẫn chưa thể bắt đầu do tắc nghẽn input từ phòng Marketing.'
        }
      ]
    }),
    plans: JSON.stringify({
      items: [
        { stt: 1, item: '[MediaTask] Dự án TVC Sự kiện', output: 'Sửa TVC theo feedback của PM/BOD và xuất bản bản Final chính thức.', deadline: '2026-04-08' },
        { stt: 2, item: '[MediaTask] Ấn phẩm Performance Ads', output: '(Ngay khi nhận Brief từ Mkt) Tiến hành quay dựng ngay luồng video UGC kéo Lead.', deadline: '2026-04-11' },
        { stt: 3, item: '[MediaTask] Video TikTok Social', output: 'Lên plan chi tiết và sản xuất đều đặn nội dung ngắn cho chuỗi 33 video TikTok.', deadline: '2026-04-12' }
      ]
    }),
    blockers: JSON.stringify({
      items: [
        {
          difficulty: 'Nhân sự VJ (Diễn viên quay) trong dự án TVC chưa thực sự chuyên nghiệp, dẫn đến việc phải quay đi quay lại nhiều lần, source bị lỗi nhiều làm khối lượng công việc hậu kỳ tăng vọt.',
          supportRequest: 'Đội Editor đang phải làm thêm giờ để xử lý source, mong PM thông cảm nếu thời gian chỉnh sửa các phiên bản Demo tiếp theo có độ trễ nhẹ. Đề xuất quy trình casting VJ chặt chẽ hơn cho các dự án sau.'
        },
        {
          difficulty: '(Lặp lại tuần trước) Vẫn chưa nhận được Brief Kịch bản chi tiết nội dung UGC từ phòng Marketing.',
          supportRequest: 'Yêu cầu Hà Canh gửi Brief trước Thứ 3 tuần tới, nếu trễ hơn Media không cam kết kịp SLA trả file cuối tuần.'
        }
      ]
    })
  },
  {
    team: 'Sale',
    weekEnding: '2026-04-05',
    leaderName: 'Nguyễn Quân',
    confidenceScore: 8,
    score: 8,
    progress: JSON.stringify({
      keyResults: [
        {
          krId: 'KR 1.2',
          title: '[INBOUND] Chuyển đổi MQL -> SQL đạt >40% và duy trì tổng giá trị Pipeline (7 ngày) luôn > 500 triệu đồng',
          previousProgress: 20,
          currentProgress: 40,
          progressChange: 20,
          activities: [
            'Xử lý dứt điểm 95% khách hàng Sub cũ còn tồn đọng trên S-CRM.',
            'Phân loại sâu tệp khách: Lọc ra các khách hàng chỉ ấn nhầm từ Adscheck sang và tìm ra những khách thực sự quan tâm tính năng cốt lõi (như Backup dữ liệu, Gửi thông báo mất quyền).'
          ],
          impact: 'Hoàn tất việc "dọn rác" phễu Inbound. Việc phân loại chuẩn xác giúp AE tiết kiệm thời gian, tập trung chăm sóc các SQL (Sales Qualified Leads) có chất lượng cao thực sự.'
        },
        {
          krId: 'KR 1.1',
          title: 'Đóng góp trực tiếp đạt 4,5 Tỷ VNĐ tổng doanh thu toàn dự án',
          previousProgress: 10,
          currentProgress: 15,
          progressChange: 5,
          activities: [
            'Chốt Deal đầu tiên: Anh Sơn (Trust Mind Agency) mua gói Finance 1 tháng (45.120.000 VNĐ) để test hệ thống. Ngân sách dự kiến 80 Tỷ.',
            'Chăm sóc Deal lớn: Gọi tư vấn sâu cho Anh Đăng (Ngân sách 10 Tỷ/tháng). Theo sát tiến độ dùng thử của đội Marketing bên anh Minh (Deal 40 Tỷ).',
            'Deal Nelly: Vẫn duy trì liên lạc chờ Tech hoàn thiện tính năng để chốt.'
          ],
          impact: 'Phát súng doanh thu đầu tiên đã nổ, tạo động lực lớn cho team. Các "cá mập" chục tỷ vẫn đang được giữ ấm trong Pipeline chờ ngày thu hoạch.'
        },
        {
          krId: 'KR 1.3',
          title: '[OUTBOUND]: Đạt tối thiểu 30% doanh thu từ nguồn Sale tự chủ động tìm kiếm (Hunting) không phụ thuộc vào Marketing (so với doanh thu tổng 4,5 tỷ)',
          previousProgress: 15,
          currentProgress: 25,
          progressChange: 10,
          activities: [
            'Liên hệ lại danh sách 8 khách hàng cũ qua Zalo, kết nối và hỗ trợ thành công 1 khách.',
            'Tăng cường tương tác trên kênh Facebook cá nhân (kết bạn đạt >1000 người, tối ưu profile chuẩn hóa).',
            'Chuẩn bị phương án và kịch bản lên forum BlackHatWorld.'
          ],
          impact: 'Tạo dựng hình ảnh chuyên gia (Social Selling) để tăng độ uy tín khi tiếp cận khách hàng lạ. Phễu Outbound bắt đầu có những viên gạch đầu tiên.'
        }
      ]
    }),
    plans: JSON.stringify({
      items: [
        { stt: 1, item: '[Deal] Chốt hợp đồng Nelly', output: 'Nhận thông tin Tech hoàn tất test và ép khách hàng ký hợp đồng chính thức (Gói All-in-One).', deadline: '2026-04-08' },
        { stt: 2, item: '[Deal] Follow-up Deal 40 Tỷ (Anh Minh)', output: 'Tìm cách thuyết phục và hỗ trợ trực tiếp nhân sự của khách hàng dùng thử các tính năng lõi để thấy giá trị.', deadline: '2026-04-10' },
        { stt: 3, item: '[SaleTask] Hunting BlackHatWorld', output: 'Tìm kiếm tối thiểu 30 KH mới trên forum BHW, liên hệ test thử kịch bản email/chat với 5 KH đầu tiên.', deadline: '2026-04-11' },
        { stt: 4, item: '[SaleTask] Kịch bản KH mới', output: 'Hoàn thiện và tối ưu hóa 100% kịch bản liên hệ khách hàng Inbound mới.', deadline: '2026-04-07' }
      ]
    }),
    blockers: JSON.stringify({
      items: [
        {
          difficulty: 'Khách hàng Anh Minh (Deal 40 tỷ) đang cho nhân sự dùng thử nhưng chỉ sử dụng mỗi tính năng "Gửi thông báo", phản hồi hiện tại là "không mặn mà lắm" và nguy cơ cao rớt deal.',
          supportRequest: 'Cần PM và Tech (Thái Phong) có phương án tung ra "Aha Block" sớm nhất có thể, hoặc hỗ trợ một luồng Demo tính năng cốt lõi (Backup dữ liệu) thật mượt mà để Sale có cớ gọi lại "kích thích" khách hàng này.'
        }
      ]
    })
  },

  // ==================== TUẦN 1 - SPRINT 2 (06/04 - 12/04/2026) ====================
  {
    team: 'Tech',
    weekEnding: '2026-04-12',
    leaderName: 'Thái Phong',
    confidenceScore: 8,
    score: 8,
    progress: JSON.stringify({
      keyResults: [
        {
          krId: 'KR 1.3',
          title: 'Release "Aha Block" và nút "Liên hệ Sale trực tiếp", đóng góp vào việc rút ngắn Time-to-value xuống 24h',
          previousProgress: 80,
          currentProgress: 90,
          progressChange: 10,
          activities: [
            'Đã hoàn tất Review Code nội bộ vào Chủ nhật.',
            'Chuẩn bị sẵn sàng môi trường và kịch bản Deploy lên Production.'
          ],
          impact: 'Tính năng lõi đã hoàn thiện 100% về mặt logic, sẵn sàng lên sóng để user mới bắt đầu được trải nghiệm luồng Onboarding siêu tốc.'
        },
        {
          krId: 'KR 2.2',
          title: 'Code và bàn giao thành công nền tảng S-CRM v2 (Dashboard, Metric Realtime) cho đội Sale',
          previousProgress: 80,
          currentProgress: 90,
          progressChange: 10,
          activities: [
            'Xử lý xong 100% giao diện và logic của module SMIT Chat.',
            'Tiến hành test nội bộ các use-case sử dụng thực tế (nhắn tin, load lịch sử).'
          ],
          impact: 'Đảm bảo đúng tiến độ bàn giao công cụ vũ khí cho đội Sale đánh trận. Sẵn sàng ra mắt bản MVP trong tuần tới.'
        },
        {
          krId: 'KR 1.4',
          title: 'Triển khai In-app Tracking thành công, ghi nhận đủ 100% dữ liệu drop-off trả về Dashboard',
          previousProgress: 50,
          currentProgress: 60,
          progressChange: 10,
          activities: [
            'Phối hợp với Hà Canh (Marketing) để chốt danh sách các Event User cần Tracking.',
            'Đấu nối luồng sự kiện tracking vào quá trình Onboarding của user.'
          ],
          impact: 'Luồng dữ liệu đã bắt đầu được đồng bộ, phục vụ trực tiếp cho việc theo dõi tỷ lệ rớt phễu của khách hàng mới.'
        },
        {
          krId: 'KR 1.2',
          title: 'Xin cấp quyền và duy trì trạng thái uptime 99.9% của tối thiểu 03 App Facebook dự phòng',
          previousProgress: 50,
          currentProgress: 60,
          progressChange: 10,
          activities: [
            'Xin quyền page_metadata cho App v1.',
            'Quay và gửi video xin quyền cho App v2. (Đang làm video cho App v3, v4).'
          ],
          impact: 'Tiến độ tuần này hơi chậm do anh em tập trung toàn lực để release Aha Block và SMIT Chat. Vẫn trong tầm kiểm soát an toàn của rủi ro sập App.'
        }
      ]
    }),
    plans: JSON.stringify({
      items: [
        { stt: 1, item: '[Epic] Tính năng Aha Block', output: 'Deploy chính thức lên Production (Thứ 2) và theo dõi độ ổn định.', deadline: '2026-04-13' },
        { stt: 2, item: '[Epic] Module SMIT Chat', output: 'Cập nhật và bàn giao bản MVP cho đội Sale (Chiều Thứ 3).', deadline: '2026-04-14' },
        { stt: 3, item: '[TechTask] Quản lý Page & Super Share', output: 'Bắt đầu nghiên cứu khả thi, thiết kế API và cắt giao diện (HTML/CSS).', deadline: '2026-04-18' },
        { stt: 4, item: '[TechTask] Triển khai AI Review Code', output: 'Cấu hình Agent tự động review code khi merge nhánh (Task đang bị chậm).', deadline: '2026-04-17' }
      ]
    }),
    blockers: JSON.stringify({
      items: [
        {
          difficulty: 'Luồng triển khai AI Code Review đang bị chậm tiến độ do thiếu nhân sự focus chuyên sâu (hiện tại giao cho Phong con nhưng chưa triển khai được).',
          supportRequest: 'PM nắm thông tin để có phương án điều chỉnh thời gian hoặc dồn lực hỗ trợ cho luồng AI này.'
        },
        {
          difficulty: 'Tính năng Tracking Event cho người dùng hiện vẫn đang phải theo sát đội MKT để chốt luồng chính xác.',
          supportRequest: 'Yêu cầu đội MKT (Hà Canh) không được delay thêm việc chốt luồng UI/UX.'
        }
      ]
    })
  },
  {
    team: 'Marketing',
    weekEnding: '2026-04-12',
    leaderName: 'Hà Canh',
    confidenceScore: 3,
    score: 4,
    progress: JSON.stringify({
      keyResults: [
        {
          krId: 'KR 1.2',
          title: 'Tìm ra tối thiểu 03 case quảng cáo Win (CTR ≥ 10%), kéo CPA trung bình giảm ≥ 15% so với Q1',
          previousProgress: 45,
          currentProgress: 50,
          progressChange: 5,
          activities: [
            'Chạy A/B test các biến thể nội dung quảng cáo trên đa kênh (Facebook, Google, TikTok Ads).',
            'Tiếp tục duy trì và theo dõi luồng ngân sách của 3 case win đã xác định từ tuần trước.'
          ],
          impact: 'CPA trung bình trên toàn tài khoản đã bắt đầu giảm 15% so với Q1 nhờ tập trung vào các nội dung đánh trúng "nỗi đau" khách hàng. Đã xác định được 2 case đặc biệt tốt (mã: recv474i9g, recv5U3lw) sẵn sàng vít ngân sách tuần tới.'
        },
        {
          krId: 'KR 1.1',
          title: 'Mang về 2.000 MQLs với tỷ lệ chuyển đổi MQL -> Signup duy trì ở mức tối thiểu 50%',
          previousProgress: 38,
          currentProgress: 45,
          progressChange: 7,
          activities: [
            'Tiếp tục đổ tiền duy trì các luồng quảng cáo hiện tại để kéo Lead về phễu.',
            'Bắt đầu booking KOC lớn cho chiến dịch UGC nhằm đa dạng hóa nguồn Lead.'
          ],
          impact: 'Tốc độ thu MQL đang bị chững lại, chưa có sự bứt phá do phụ thuộc vào các Landing Page cũ đã giảm hiệu suất chuyển đổi. Buộc phải đẩy nhanh việc ra mắt 5 Landing Page mới để cải thiện tỷ lệ này.'
        },
        {
          krId: 'KR 2.1',
          title: 'Validate thành công 3 thị trường Global tiềm năng với mức ROI > [X]%',
          previousProgress: 20,
          currentProgress: 25,
          progressChange: 5,
          activities: [
            'Đã hoàn thành 10 bài đăng đầu tiên trên diễn đàn BlackHatWorld để nuôi độ trust cho tài khoản chuẩn bị đánh Global.'
          ],
          impact: 'Khâu tiền trạm (chuẩn bị tài khoản) đang diễn ra theo đúng kế hoạch, tuy nhiên các bước triển khai chạy Test thực tế vẫn còn rất chậm do Mkt đang vướng bận rào cản luồng Tracking trong nước.'
        }
      ]
    }),
    plans: JSON.stringify({
      items: [
        { stt: 1, item: '[Campaign] Landing Page Ads mới', output: 'Gửi wireframe nội dung chi tiết của 5 Landing Page cho đội Thiết kế / Ladipage cắt web.', deadline: '2026-04-15' },
        { stt: 2, item: '[MktTask] Tracking In-app & Retargeting', output: 'Gửi tài liệu khung Tracking (AARRR) hoàn chỉnh cho đội Dev chuẩn bị đấu nối.', deadline: '2026-04-16' },
        { stt: 3, item: '[Campaign] Scale ngân sách QC', output: 'Tăng 20-30% ngân sách (Budget) vào 2 case nội dung quảng cáo đang có CPA tốt nhất hiện tại.', deadline: '2026-04-14' },
        { stt: 4, item: '[MktTask] Sản xuất nội dung mới', output: 'Viết và triển khai 15 post nội dung mới + 3-5 video ads theo chủ đề "Lợi ích nhanh".', deadline: '2026-04-13' }
      ]
    }),
    blockers: JSON.stringify({
      items: [
        {
          difficulty: 'Tiến độ hoàn thiện Website SMIT.VN vẫn đang bị đình trệ. Việc chậm trễ này dẫn đến không thể thiết lập hệ thống Tracking đo lường (GA4/Pixel) chính xác cho khách hàng đổ về.',
          supportRequest: 'RỦI RO VỠ ROADMAP TOÀN THÁNG 4! Đội MKT cần PM Nguyễn Quân trực tiếp nhảy vào ép deadline, phối hợp cùng Tech & Design (Thái Phong) chốt dứt điểm khung Website ngay lập tức để Marketing có cơ sở gắn mã tracking chạy các chiến dịch mới.'
        }
      ]
    })
  },
  {
    team: 'Media',
    weekEnding: '2026-04-12',
    leaderName: 'Thành Long',
    confidenceScore: 7,
    score: 7,
    progress: JSON.stringify({
      keyResults: [
        {
          krId: 'KR 1.1',
          title: 'Đạt tối thiểu 01 video 1.000.000 views trên TikTok/Shorts (Dự án TVC & Chuỗi 33 Video)',
          previousProgress: 60,
          currentProgress: 70,
          progressChange: 10,
          activities: [
            'Dự án TVC: Đã tiếp nhận feedback từ PM/BOD, hoàn thiện chỉnh sửa các hiệu ứng hậu kỳ cho bản Demo Ver 1 để chuẩn bị xuất bản Final.',
            'Chuỗi 33 Video TikTok: Đã bắt đầu tiến hành sản xuất và đăng tải những video ngắn đầu tiên trên kênh TikTok.'
          ],
          impact: 'Dự án đinh (TVC) sắp hoàn thiện 100%. Các video TikTok ngắn bắt đầu cắn đề xuất, kéo lại tương tác kênh và đóng góp thêm 5% tiến độ phủ sóng thương hiệu theo kế hoạch.'
        },
        {
          krId: 'KR 2.1',
          title: 'Đảm bảo SLA: 100% các yêu cầu ấn phẩm (Video Onboarding, Layout PDF Sale, Ads Creative) được hoàn thành đúng deadline',
          previousProgress: 0,
          currentProgress: 15,
          progressChange: 15,
          activities: [
            'Đã tiếp nhận yêu cầu từ đội Tech (Thái Phong) về việc sản xuất "Video hướng dẫn nhúng" dành cho tính năng Aha Block.',
            'Đang lên kịch bản chi tiết và chuẩn bị quay màn hình/hướng dẫn.'
          ],
          impact: 'Bắt đầu phát huy đúng vai trò "Xưởng sản xuất". Video này sẽ hỗ trợ trực tiếp đội Tech hoàn thiện luồng Onboarding siêu tốc cho khách hàng.'
        },
        {
          krId: 'KR 2.2',
          title: 'Ứng dụng AI Agent giúp tăng [Y] lần số lượng ấn phẩm phát hành mỗi tuần mà không tăng nhân sự',
          previousProgress: 100,
          currentProgress: 100,
          progressChange: 0,
          activities: [
            'Áp dụng triệt để AI (Weavy AI lên kịch bản, CapCut Pro xử lý hiệu ứng) vào chuỗi sản xuất video TikTok hàng ngày.'
          ],
          impact: 'Giúp duy trì được tần suất ra video đều đặn mà các Editor không bị quá tải. Tiến độ hạ tầng AI đã hoàn thành nên tuần này duy trì ở mức 100%.'
        }
      ]
    }),
    plans: JSON.stringify({
      items: [
        { stt: 1, item: '[MediaTask] Video hướng dẫn Aha Block', output: 'Quay dựng xong và bàn giao file mp4 chuẩn cho đội Tech để nhúng vào hệ thống.', deadline: '2026-04-14' },
        { stt: 2, item: '[MediaTask] Dự án TVC Sự kiện', output: 'Chốt duyệt lần cuối cùng PM và xuất bản bản Final chính thức.', deadline: '2026-04-13' },
        { stt: 3, item: '[MediaTask] Sản xuất Video UGC', output: '(Ngay khi nhận Brief đợt 2 từ Mkt) Đẩy mạnh sản xuất luồng video Ads kéo Lead.', deadline: '2026-04-16' }
      ]
    }),
    blockers: JSON.stringify({
      items: [
        {
          difficulty: 'Đội Media vẫn đang phải chờ đợi Brief kịch bản chi tiết đợt 2 từ phòng Marketing cho luồng Performance Ads (UGC/Case Study) khiến việc phân bổ nguồn lực quay dựng bị đứt quãng.',
          supportRequest: 'Đề nghị PM đốc thúc Hà Canh (Mkt) bàn giao sớm các Brief này. Tránh tình trạng dồn kịch bản vào cuối Sprint khiến Media bị quá tải và vỡ SLA trả ấn phẩm.'
        }
      ]
    })
  },
  {
    team: 'Sale',
    weekEnding: '2026-04-12',
    leaderName: 'Nguyễn Quân',
    confidenceScore: 9,
    score: 9,
    progress: JSON.stringify({
      keyResults: [
        {
          krId: 'KR 1.1',
          title: 'Đóng góp trực tiếp đạt 4,5 Tỷ VNĐ tổng doanh thu toàn dự án',
          previousProgress: 15,
          currentProgress: 90,
          progressChange: 75,
          activities: [
            'BÙNG NỔ DEAL NELLY: Đã demo xong toàn bộ hệ thống. Khách hàng ĐỒNG Ý CHỐT gói All-in-One cho ngân sách khổng lồ 500 Tỷ VNĐ / 20.000 TKQC.',
            'Đã trao đổi hoàn tất các yêu cầu custom thêm của khách, tổng hợp đầy đủ thông tin về phần "Quản lý Page" để chuyển giao cho bộ phận Tech.',
            'Theo sát tiến trình tự test của Anh Đức Anh Lê (Gói 10 tỷ).'
          ],
          impact: 'Đây là cú hích lịch sử của dự án. Gần như đã hoàn thành mục tiêu doanh thu của không chỉ Quý 2 mà còn cả năm nếu Deal này chính thức giải ngân thành công.'
        },
        {
          krId: 'KR 1.2',
          title: '[INBOUND] Chuyển đổi MQL -> SQL đạt >40% và duy trì tổng giá trị Pipeline (7 ngày) luôn > 500 triệu đồng',
          previousProgress: 40,
          currentProgress: 45,
          progressChange: 5,
          activities: [
            'Xử lý 100% Sub mới đăng ký từ sau Tết đến hiện tại (Nhận 24 sub mới trong tuần).',
            'Tư vấn và sàng lọc, duy trì Tổng giá trị cơ hội bán hàng (Opportunities) của nhóm khách hàng phổ thông ở mức 450.000.000 VNĐ.'
          ],
          impact: 'Phễu Inbound hoạt động trơn tru. Dù đang tập trung đánh "cá mập" nhưng AE vẫn đảm bảo Lead đổ về được chăm sóc ngay lập tức, không để tồn đọng.'
        },
        {
          krId: 'KR 1.3',
          title: '[OUTBOUND]: Đạt tối thiểu 30% doanh thu từ nguồn Sale tự chủ động tìm kiếm (Hunting) không phụ thuộc vào Marketing (so với doanh thu tổng 4,5 tỷ)',
          previousProgress: 25,
          currentProgress: 30,
          progressChange: 5,
          activities: [
            'Dọn dẹp sạch sẽ, xóa thông tin rác trên các Profile Facebook cá nhân để chuẩn bị hình ảnh chuyên nghiệp nhất.',
            'Lấy khách hàng sub người nước ngoài (để lại email trên S-CRM), tra cứu chéo trên diễn đàn BlackHatWorld để tìm kiếm thông tin Telegram/Skype kết nối trực tiếp.',
            'Up bài, daily story đều đặn 2 bài/ngày trên Zalo công việc.'
          ],
          impact: 'Phễu Outbound đang chuyển dịch trọng tâm sang tìm kiếm khách Global (quốc tế). Các bước dọn dẹp profile và research chéo là nền tảng bắt buộc để out-reach hiệu quả.'
        }
      ]
    }),
    plans: JSON.stringify({
      items: [
        { stt: 1, item: '[Deal] Hợp đồng Khách hàng Nelly', output: 'Thúc đẩy Tech hoàn thiện luồng Quản lý Page, tiến hành ký Hợp đồng và giải ngân.', deadline: '2026-04-15' },
        { stt: 2, item: '[Deal] Chốt Deal Đức Anh Lê', output: 'Xử lý các thắc mắc cuối cùng sau quá trình dùng thử để chốt gói 10 Tỷ.', deadline: '2026-04-17' },
        { stt: 3, item: '[SaleTask] Hunting Global', output: 'Bắt đầu tiếp cận và nhắn tin kịch bản Outbound cho khách hàng trên diễn đàn BlackHatWorld.', deadline: '2026-04-18' }
      ]
    }),
    blockers: JSON.stringify({
      items: [
        {
          difficulty: 'Deal khổng lồ Nelly (500 Tỷ) hiện tại đã chốt mồm xong, nhưng điều kiện bắt buộc để ký Hợp đồng là hệ thống phải có tính năng "Quản lý Page & Agency Super Share" (tính năng custom thêm).',
          supportRequest: 'Yêu cầu đội Tech (Thái Phong, Giang Trường) dồn 200% nguồn lực để đẩy nhanh tiến độ nghiên cứu và Code API tính năng Quản lý Page. Khách hàng lớn không có nhiều sự kiên nhẫn, nếu Tech delay quá lâu deal này sẽ bị "nguội" và có nguy cơ rớt!'
        }
      ]
    })
  }
];

async function main() {
  console.log('🚀 Seeding weekly reports...\n');

  // Get all users from the database
  const users = await prisma.user.findMany();

  // Create a map of fullName to user ID
  const userMap = new Map<string, string>();
  users.forEach(user => {
    userMap.set(user.fullName, user.id);
    console.log(`   Found user: ${user.fullName} (${user.departments.join(', ')})`);
  });

  console.log('\n');

  let created = 0;
  let skipped = 0;

  for (const reportData of weeklyReportsData) {
    const userId = userMap.get(reportData.leaderName);

    if (!userId) {
      console.log(`⚠️  Skipping report for ${reportData.leaderName} (Week ending: ${reportData.weekEnding}) - User not found in database`);
      skipped++;
      continue;
    }

    try {
      await prisma.weeklyReport.create({
        data: {
          userId,
          weekEnding: new Date(reportData.weekEnding),
          progress: reportData.progress,
          plans: reportData.plans,
          blockers: reportData.blockers,
          score: reportData.score,
          confidenceScore: reportData.confidenceScore,
        },
      });

      console.log(`✅ Created report: ${reportData.leaderName} (${reportData.team}) - Week ending ${reportData.weekEnding} (Confidence: ${reportData.confidenceScore}/10, Score: ${reportData.score}/10)`);
      created++;
    } catch (error) {
      console.error(`❌ Error creating report for ${reportData.leaderName} (${reportData.weekEnding}):`, error);
    }
  }

  console.log(`\n🎉 Seeding complete!`);
  console.log(`   • ${created} reports created`);
  console.log(`   • ${skipped} reports skipped (user not found)`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
