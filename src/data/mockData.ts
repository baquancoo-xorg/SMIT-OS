import { Objective, User, WorkItem } from '../types';

export const users: User[] = [
  { id: 'u1', fullName: 'Nguyễn Quân', department: 'BOD', role: 'PM', avatar: 'https://picsum.photos/seed/quan/100/100' },
  { id: 'u2', fullName: 'Thái Phong', department: 'Tech', role: 'Tech Leader', avatar: 'https://picsum.photos/seed/phong/100/100' },
  { id: 'u3', fullName: 'Hà Canh', department: 'Marketing', role: 'Mkt Leader', avatar: 'https://picsum.photos/seed/canh/100/100' },
  { id: 'u4', fullName: 'Thành Long', department: 'Media', role: 'Media Leader', avatar: 'https://picsum.photos/seed/long/100/100' },
];

export const l1Objectives: Objective[] = [
  {
    id: 'l1-o1',
    level: 'L1',
    title: 'Bứt phá doanh thu 4,5 Tỷ bằng cách tối ưu hóa phễu chuyển đổi và rút ngắn chu kỳ bán hàng.',
    ownerId: 'u1',
    quarter: 'Q2-2026',
    progressPercentage: 45,
    keyResults: [
      { 
        id: 'kr1.1', 
        title: 'Rút ngắn Vòng đời bán hàng (Sale Cycle) trung bình xuống mức kỳ vọng dưới 45 ngày.', 
        targetValue: 45, 
        currentValue: 50, 
        unit: 'ngày',
        dueDate: '2026-04-15',
        subKeyResults: [
          { id: 'skr1.1.1', title: 'Tối ưu hóa quy trình demo sản phẩm', targetValue: 100, currentValue: 60, unit: '%', dueDate: '2026-04-12' },
          { id: 'skr1.1.2', title: 'Rút ngắn thời gian phản hồi khách hàng', targetValue: 2, currentValue: 4, unit: 'giờ', dueDate: '2026-04-20' }
        ]
      },
      { id: 'kr1.2', title: 'Số lượng MQL thu về đạt tối thiểu 2.000 Leads.', targetValue: 2000, currentValue: 800, unit: 'Leads', dueDate: '2026-05-01' },
      { id: 'kr1.3', title: 'Tỷ lệ chuyển đổi từ MQL sang SQL đạt tối thiểu 40%.', targetValue: 40, currentValue: 25, unit: '%', dueDate: '2026-04-05' },
    ]
  },
  {
    id: 'l1-o2',
    level: 'L1',
    title: 'Bảo vệ "sinh mệnh" hệ thống và Nâng cấp đột phá trải nghiệm người dùng (UX).',
    ownerId: 'u1',
    quarter: 'Q2-2026',
    progressPercentage: 60,
    keyResults: [
      { id: 'kr2.1', title: 'Giảm thời gian loading do lỗi Proxy xuống dưới 10%.', targetValue: 10, currentValue: 15, unit: '%' },
      { id: 'kr2.2', title: 'Đạt tỷ lệ chuyển đổi từ MQL sang PQL là 50%.', targetValue: 50, currentValue: 30, unit: '%' },
      { id: 'kr2.3', title: 'Rút ngắn Time-to-value (TTV) xuống mức 24 giờ.', targetValue: 24, currentValue: 36, unit: 'giờ' },
      { id: 'kr2.4', title: 'Thu thập thành công 100% dữ liệu drop-off.', targetValue: 100, currentValue: 100, unit: '%' },
    ]
  },
  {
    id: 'l1-o3',
    level: 'L1',
    title: 'Xây dựng Brand Trust vững chắc đa nền tảng.',
    ownerId: 'u1',
    quarter: 'Q2-2026',
    progressPercentage: 35,
    keyResults: []
  },
  {
    id: 'l1-o4',
    level: 'L1',
    title: 'Tự động hóa vận hành bằng AI và thiết lập nền móng Go Global.',
    ownerId: 'u1',
    quarter: 'Q2-2026',
    progressPercentage: 15,
    keyResults: []
  }
];

export const l2Objectives: Objective[] = [
  {
    id: 'tech-o1',
    level: 'L2',
    title: 'Khơi thông phễu Onboarding và dọn dẹp triệt để nợ kỹ thuật (Tech Debt).',
    ownerId: 'u2',
    department: 'Tech',
    parentObjectiveId: 'l1-o2',
    quarter: 'Q2-2026',
    progressPercentage: 70,
    keyResults: [
      { id: 'kr-t1.1', title: 'Giảm tỷ lệ lỗi Proxy đầu vào xuống dưới 10%', targetValue: 10, currentValue: 12, unit: '%' },
      { id: 'kr-t1.2', title: 'Release "Aha Block" và nút "Liên hệ Sale trực tiếp"', targetValue: 100, currentValue: 100, unit: '%' }
    ]
  },
  {
    id: 'tech-o2',
    level: 'L2',
    title: 'Hoàn thiện hệ sinh thái tính năng Agency để đạt Partner Meta và phục vụ Vận hành nội bộ.',
    ownerId: 'u2',
    department: 'Tech',
    parentObjectiveId: 'l1-o1',
    quarter: 'Q2-2026',
    progressPercentage: 40,
    keyResults: [
      { id: 'kr-t2.1', title: 'Code và bàn giao thành công nền tảng S-CRM v2', targetValue: 100, currentValue: 40, unit: '%' }
    ]
  },
  {
    id: 'tech-o3',
    level: 'L2',
    title: 'Làm chủ "AI Dev Cycle" để bứt phá hiệu suất nhân sự và hệ thống hóa tri thức.',
    ownerId: 'u2',
    department: 'Tech',
    parentObjectiveId: 'l1-o4',
    quarter: 'Q2-2026',
    progressPercentage: 20,
    keyResults: []
  },
  {
    id: 'mkt-o1',
    level: 'L2',
    title: 'Tìm ra Winning Content Formula để tạo cỗ máy Lead Gen vô tận.',
    ownerId: 'u3',
    department: 'Marketing',
    parentObjectiveId: 'l1-o1',
    quarter: 'Q2-2026',
    progressPercentage: 55,
    keyResults: [
      { id: 'kr-m1.1', title: 'Mang về tối thiểu 2.000 MQLs', targetValue: 2000, currentValue: 1100, unit: 'MQLs' },
      { id: 'kr-m1.2', title: 'Tìm ra tối thiểu 03 case quảng cáo Win (CTR ≥ 10%)', targetValue: 3, currentValue: 1, unit: 'case' }
    ]
  },
  {
    id: 'mkt-o2',
    level: 'L2',
    title: 'Xây dựng bộ tiêu chí kiểm thử và Validate thị trường Global.',
    ownerId: 'u3',
    department: 'Marketing',
    parentObjectiveId: 'l1-o4',
    quarter: 'Q2-2026',
    progressPercentage: 10,
    keyResults: []
  },
  {
    id: 'media-o1',
    level: 'L2',
    title: 'Tăng cường Brand Awareness thông qua mạng xã hội và nội dung số chuyên sâu.',
    ownerId: 'u4',
    department: 'Media',
    parentObjectiveId: 'l1-o3',
    quarter: 'Q2-2026',
    progressPercentage: 30,
    keyResults: [
      { id: 'kr-md1.1', title: 'Đạt tối thiểu 01 video 1.000.000 lượt xem tự nhiên', targetValue: 1000000, currentValue: 300000, unit: 'views' }
    ]
  },
  {
    id: 'sale-o1',
    level: 'L2',
    title: 'Chuyển hóa tối đa cơ hội thành Doanh thu 4,5 Tỷ và quản trị Data khách hàng chặt chẽ.',
    ownerId: 'u1',
    department: 'Sale',
    parentObjectiveId: 'l1-o1',
    quarter: 'Q2-2026',
    progressPercentage: 45,
    keyResults: [
      { id: 'kr-s1.1', title: 'Đóng góp trực tiếp đạt 4,5 Tỷ VNĐ tổng doanh thu', targetValue: 4500000000, currentValue: 2000000000, unit: 'VNĐ' }
    ]
  }
];

export const workItems: WorkItem[] = [
  // Tech
  { 
    id: 't1', 
    type: 'UserStory', 
    title: 'Fix lỗi Proxy khi login', 
    description: 'Hiện tại hệ thống đang gặp lỗi 502 khi người dùng cố gắng login qua proxy của công ty. Cần kiểm tra lại cấu hình Nginx và timeout.',
    subtasks: [
      { id: 'st1', title: 'Kiểm tra log Nginx', completed: true },
      { id: 'st2', title: 'Tăng timeout proxy_read_timeout', completed: false },
      { id: 'st3', title: 'Verify với team DevOps', completed: false }
    ],
    linkedKrId: 'kr2.1', 
    assigneeId: 'u2', 
    priority: 'Urgent',
    estimatedTime: '4h',
    status: 'In Progress', 
    sprintId: 's1', 
    storyPoint: 5 
  },
  { 
    id: 't2', 
    type: 'Epic', 
    title: 'Aha Block Onboarding', 
    description: 'Xây dựng chuỗi trải nghiệm "Aha Moment" cho người dùng mới ngay sau khi đăng ký thành công.',
    priority: 'High',
    estimatedTime: '2w',
    subtasks: [
      { id: 'st4', title: 'Thiết kế UI/UX cho Aha Block', completed: true },
      { id: 'st5', title: 'Implement tracking event', completed: false },
      { id: 'st6', title: 'A/B Testing với nhóm user nhỏ', completed: false }
    ],
    linkedKrId: 'kr1.3', 
    assigneeId: 'u2', 
    status: 'To Do', 
    sprintId: 's1', 
    storyPoint: 13 
  },
  { id: 't3', type: 'TechTask', title: 'Setup In-app Tracking', priority: 'Medium', estimatedTime: '1d', linkedKrId: 'kr1.4', assigneeId: 'u2', status: 'Done', sprintId: 's1', storyPoint: 3 },
  { id: 't4', type: 'UserStory', title: 'Tích hợp API Meta', priority: 'High', estimatedTime: '3d', linkedKrId: 'kr2.1', assigneeId: 'u2', status: 'Code Review', sprintId: 's1', storyPoint: 8 },
  
  // Mkt
  { id: 'm1', type: 'Campaign', title: 'Webinar: Tối ưu Ads', priority: 'High', estimatedTime: '5d', linkedKrId: 'kr1.1', assigneeId: 'u3', status: 'Doing', dueDate: '2026-04-15' },
  { id: 'm2', type: 'MktTask', title: 'Viết kịch bản Seeding', priority: 'Medium', estimatedTime: '2h', linkedKrId: 'kr1.2', assigneeId: 'u3', status: 'Idea', dueDate: '2026-04-12' },
  { id: 'm3', type: 'Campaign', title: 'A/B Test Landing Page', priority: 'Low', estimatedTime: '3d', linkedKrId: 'kr1.1', assigneeId: 'u3', status: 'Review', dueDate: '2026-04-20' },
  
  // Media
  { id: 'md1', type: 'MediaTask', title: 'Edit Video Onboarding', linkedKrId: 'kr2.1', assigneeId: 'u4', status: 'Doing', dueDate: '2026-04-14' },
  { id: 'md2', type: 'MediaTask', title: 'Thiết kế Layout PDF Sale', linkedKrId: 'kr2.1', assigneeId: 'u4', status: 'Done', dueDate: '2026-04-10' },

  // Sale
  { id: 's1', type: 'SaleTask', title: 'Hợp đồng Agency A', linkedKrId: 'kr-s1.1', assigneeId: 'u1', status: 'Review', customerName: 'Công ty TNHH ABC', dealValue: 150000000 },
  { id: 's2', type: 'SaleTask', title: 'Gói Enterprise B', linkedKrId: 'kr-s1.1', assigneeId: 'u1', status: 'Doing', customerName: 'Tập đoàn XYZ', dealValue: 300000000 },
  { id: 's3', type: 'SaleTask', title: 'Gói Standard C', linkedKrId: 'kr-s1.1', assigneeId: 'u1', status: 'Done', customerName: 'Startup DEF', dealValue: 50000000 },
  { id: 's4', type: 'SaleTask', title: 'Tư vấn giải pháp D', linkedKrId: 'kr-s1.1', assigneeId: 'u1', status: 'Idea', customerName: 'Công ty GHI', dealValue: 80000000 },
  { id: 's5', type: 'SaleTask', title: 'Lead từ Webinar', linkedKrId: 'kr-s1.1', assigneeId: 'u1', status: 'Idea', customerName: 'Nguyễn Văn A', dealValue: 20000000 },
];
