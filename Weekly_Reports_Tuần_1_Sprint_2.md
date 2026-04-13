# Tech\&Product

# **WEEKLY CHECK-IN (SMIT OS)**

*(Tài liệu sử dụng cho buổi họp Saturday Sync hàng tuần)*

**THÔNG TIN CHUNG**

* **Kỳ báo cáo:** Tuần 1 (Sprint 2\) \- Tháng 04 / 2026 (06/04 \- 12/04)  
* **Đội / Phòng ban:** Tech & Product  
* **Người báo cáo (Leader):** Nguyễn Thái Phong  
* **Mức độ tự tin đạt OKRs Quý (1-10):** \[ 8 \] / 10  
  *(Lưu ý: 8-10: Tốt, 5-7: Có rủi ro nhưng kiểm soát được, \<5: Báo động đỏ cần PM hỗ trợ gấp).*

## **PHẦN 1: BÁO CÁO TIẾN ĐỘ THEO TỪNG KEY RESULT (KR)**

### **🎯 \[KR 1.3\]: Release "Aha Block" và nút "Liên hệ Sale trực tiếp", đóng góp vào việc rút ngắn Time-to-value xuống 24h.**

* **Tiến độ tuần trước:** \[ 80 \] %  
* **Tiến độ hiện tại (Sau khi cộng dồn):** \[ 90 \] %

**1\. Đã làm gì trong tuần qua?**

* Đã hoàn tất Review Code nội bộ vào Chủ nhật.  
* Chuẩn bị sẵn sàng môi trường và kịch bản Deploy lên Production.

**2\. Đánh giá mức độ ảnh hưởng đến KR:**

* Tính năng lõi đã hoàn thiện 100% về mặt logic, sẵn sàng lên sóng để user mới bắt đầu được trải nghiệm luồng Onboarding siêu tốc.  
* **3\. Thay đổi tiến độ:** \+ \[ 10 \] %

### **🎯 \[KR 2.2\]: Code và bàn giao thành công nền tảng S-CRM v2 (Dashboard, Metric Realtime) cho đội Sale.**

* **Tiến độ tuần trước:** \[ 80 \] %  
* **Tiến độ hiện tại (Sau khi cộng dồn):** \[ 90 \] %

**1\. Đã làm gì trong tuần qua?**

* Xử lý xong 100% giao diện và logic của module SMIT Chat.  
* Tiến hành test nội bộ các use-case sử dụng thực tế (nhắn tin, load lịch sử).

**2\. Đánh giá mức độ ảnh hưởng đến KR:**

* Đảm bảo đúng tiến độ bàn giao công cụ vũ khí cho đội Sale đánh trận. Sẵn sàng ra mắt bản MVP trong tuần tới.  
* **3\. Thay đổi tiến độ:** \+ \[ 10 \] %

### **🎯 \[KR 1.4\]: Triển khai In-app Tracking thành công, ghi nhận đủ 100% dữ liệu drop-off trả về Dashboard.**

* **Tiến độ tuần trước:** \[ 50 \] %  
* **Tiến độ hiện tại (Sau khi cộng dồn):** \[ 60 \] %

**1\. Đã làm gì trong tuần qua?**

* Phối hợp với Hà Canh (Marketing) để chốt danh sách các Event User cần Tracking.  
* Đấu nối luồng sự kiện tracking vào quá trình Onboarding của user.

**2\. Đánh giá mức độ ảnh hưởng đến KR:**

* Luồng dữ liệu đã bắt đầu được đồng bộ, phục vụ trực tiếp cho việc theo dõi tỷ lệ rớt phễu của khách hàng mới.  
* **3\. Thay đổi tiến độ:** \+ \[ 10 \] %

### **🎯 \[KR 1.2\]: Xin cấp quyền và duy trì trạng thái uptime 99.9% của tối thiểu 03 App Facebook dự phòng.**

* **Tiến độ tuần trước:** \[ 50 \] %  
* **Tiến độ hiện tại (Sau khi cộng dồn):** \[ 60 \] %

**1\. Đã làm gì trong tuần qua?**

* Xin quyền page\_metadata cho App v1.  
* Quay và gửi video xin quyền cho App v2. (Đang làm video cho App v3, v4).

**2\. Đánh giá mức độ ảnh hưởng đến KR:**

* Tiến độ tuần này hơi chậm do anh em tập trung toàn lực để release Aha Block và SMIT Chat. Vẫn trong tầm kiểm soát an toàn của rủi ro sập App.  
* **3\. Thay đổi tiến độ:** \+ \[ 10 \] %

## **PHẦN 2: CAM KẾT HÀNH ĐỘNG TUẦN TỚI (NEXT WEEK PLAN)**

| **STT** | **Hạng mục (Epic/Campaign/Deal)** | **Cam kết đầu ra (Output cụ thể)** | **Deadline** |

| 1 | \[Epic\] Tính năng Aha Block | Deploy chính thức lên Production (Thứ 2\) và theo dõi độ ổn định. | 13/04/2026 |

| 2 | \[Epic\] Module SMIT Chat | Cập nhật và bàn giao bản MVP cho đội Sale (Chiều Thứ 3). | 14/04/2026 |

| 3 | \[TechTask\] Quản lý Page & Super Share | Bắt đầu nghiên cứu khả thi, thiết kế API và cắt giao diện (HTML/CSS). | 18/04/2026 |

| 4 | \[TechTask\] Triển khai AI Review Code | Cấu hình Agent tự động review code khi merge nhánh (Task đang bị chậm). | 17/04/2026 |

## **PHẦN 3: RÀO CẢN & YÊU CẦU HỖ TRỢ (BLOCKERS) 🚨**

* **Khó khăn 1:** Luồng triển khai AI Code Review đang bị chậm tiến độ do thiếu nhân sự focus chuyên sâu (hiện tại giao cho Phong con nhưng chưa triển khai được).  
* **Yêu cầu hỗ trợ từ PM/Phòng ban khác:** PM nắm thông tin để có phương án điều chỉnh thời gian hoặc dồn lực hỗ trợ cho luồng AI này.  
* **Khó khăn 2:** Tính năng Tracking Event cho người dùng hiện vẫn đang phải theo sát đội MKT để chốt luồng chính xác.  
* **Yêu cầu hỗ trợ từ PM/Phòng ban khác:** Yêu cầu đội MKT (Hà Canh) không được delay thêm việc chốt luồng UI/UX.

*Xác nhận của Leader:* **Nguyễn Thái Phong**

# Marketing

# **WEEKLY CHECK-IN (SMIT OS)**

*(Tài liệu sử dụng cho buổi họp Saturday Sync hàng tuần)*

**THÔNG TIN CHUNG**

* **Kỳ báo cáo:** Tuần 1 (Sprint 2\) \- Tháng 04 / 2026 (06/04 \- 12/04)  
* **Đội / Phòng ban:** Marketing  
* **Người báo cáo (Leader):** Hà Canh  
* **Mức độ tự tin đạt OKRs Quý (1-10):** 3 / 10  
  *(Lưu ý: 8-10: Tốt, 5-7: Có rủi ro nhưng kiểm soát được, \<5: Báo động đỏ cần PM hỗ trợ gấp).*  
  *(Ghi chú PM: Báo động đỏ\! Nhiều KR chưa có kết quả rõ ràng, tiến độ chậm so với timeline quý).*

## **PHẦN 1: BÁO CÁO TIẾN ĐỘ THEO TỪNG KEY RESULT (KR)**

### **🎯 \[KR 1.2\]: Tìm ra tối thiểu 03 case quảng cáo Win (CTR ≥ 10%), kéo CPA trung bình giảm ≥ 15% so với Q1.**

* **Tiến độ tuần trước:** 45 %  
* **Tiến độ hiện tại (Sau khi cộng dồn):** 50 %

**1\. Đã làm gì trong tuần qua?**

* Chạy A/B test các biến thể nội dung quảng cáo trên đa kênh (Facebook, Google, TikTok Ads).  
* Tiếp tục duy trì và theo dõi luồng ngân sách của 3 case win đã xác định từ tuần trước.

**2\. Đánh giá mức độ ảnh hưởng đến KR:**

* CPA trung bình trên toàn tài khoản đã bắt đầu giảm 15% so với Q1 nhờ tập trung vào các nội dung đánh trúng "nỗi đau" khách hàng. Đã xác định được 2 case đặc biệt tốt (mã: recv474i9g, recv5U3lw) sẵn sàng vít ngân sách tuần tới.  
* **3\. Thay đổi tiến độ:** \+ 5 %

### **🎯 \[KR 1.1\]: Mang về 2.000 MQLs với tỷ lệ chuyển đổi MQL \-\> Signup duy trì ở mức tối thiểu 50%.**

* **Tiến độ tuần trước:** 38 %  
* **Tiến độ hiện tại (Sau khi cộng dồn):** 45 %

**1\. Đã làm gì trong tuần qua?**

* Tiếp tục đổ tiền duy trì các luồng quảng cáo hiện tại để kéo Lead về phễu.  
* Bắt đầu booking KOC lớn cho chiến dịch UGC nhằm đa dạng hóa nguồn Lead.

**2\. Đánh giá mức độ ảnh hưởng đến KR:**

* Tốc độ thu MQL đang bị chững lại, chưa có sự bứt phá do phụ thuộc vào các Landing Page cũ đã giảm hiệu suất chuyển đổi. Buộc phải đẩy nhanh việc ra mắt 5 Landing Page mới để cải thiện tỷ lệ này.  
* **3\. Thay đổi tiến độ:** \+ 7 %

### **🎯 \[KR 2.1\]: Validate thành công 3 thị trường Global tiềm năng với mức ROI \> \[X\]%.**

* **Tiến độ tuần trước:** 20 %  
* **Tiến độ hiện tại (Sau khi cộng dồn):** 25 %

**1\. Đã làm gì trong tuần qua?**

* Đã hoàn thành 10 bài đăng đầu tiên trên diễn đàn BlackHatWorld để nuôi độ trust cho tài khoản chuẩn bị đánh Global.

**2\. Đánh giá mức độ ảnh hưởng đến KR:**

* Khâu tiền trạm (chuẩn bị tài khoản) đang diễn ra theo đúng kế hoạch, tuy nhiên các bước triển khai chạy Test thực tế vẫn còn rất chậm do Mkt đang vướng bận rào cản luồng Tracking trong nước.  
* **3\. Thay đổi tiến độ:** \+ 5 %

## **PHẦN 2: CAM KẾT HÀNH ĐỘNG TUẦN TỚI (NEXT WEEK PLAN)**

| **STT** | **Hạng mục (Epic/Campaign/Deal)** | **Cam kết đầu ra (Output cụ thể)** | **Deadline** |

| 1 | \[Campaign\] Landing Page Ads mới | Gửi wireframe nội dung chi tiết của 5 Landing Page cho đội Thiết kế / Ladipage cắt web. | 15/04/2026 |

| 2 | \[MktTask\] Tracking In-app & Retargeting | Gửi tài liệu khung Tracking (AARRR) hoàn chỉnh cho đội Dev chuẩn bị đấu nối. | 16/04/2026 |

| 3 | \[Campaign\] Scale ngân sách QC | Tăng 20-30% ngân sách (Budget) vào 2 case nội dung quảng cáo đang có CPA tốt nhất hiện tại. | 14/04/2026 |

| 4 | \[MktTask\] Sản xuất nội dung mới | Viết và triển khai 15 post nội dung mới \+ 3-5 video ads theo chủ đề "Lợi ích nhanh". | 13/04/2026 |

## **PHẦN 3: RÀO CẢN & YÊU CẦU HỖ TRỢ (BLOCKERS) 🚨**

* **Khó khăn 1:** Tiến độ hoàn thiện Website SMIT.VN vẫn đang bị đình trệ. Việc chậm trễ này dẫn đến không thể thiết lập hệ thống Tracking đo lường (GA4/Pixel) chính xác cho khách hàng đổ về.  
* **Yêu cầu hỗ trợ từ PM/Phòng ban khác:** **RỦI RO VỠ ROADMAP TOÀN THÁNG 4\!** Đội MKT cần PM Nguyễn Quân trực tiếp nhảy vào ép deadline, phối hợp cùng Tech & Design (Thái Phong) chốt dứt điểm khung Website ngay lập tức để Marketing có cơ sở gắn mã tracking chạy các chiến dịch mới.

*Xác nhận của Leader:* **Hà Canh**

# Media

# **WEEKLY CHECK-IN (SMIT OS)**

*(Tài liệu sử dụng trước buổi họp Saturday Sync hàng tuần)*

### **THÔNG TIN CHUNG**

* **Kỳ báo cáo:** Tuần 1 (Sprint 2\) \- Tháng 04 / 2026 (06/04 \- 12/04)  
* **Đội / Phòng ban:** Media  
* **Người báo cáo (Leader):** Đoàn Thanh Long  
* **Mức độ tự tin đạt OKRs Quý (1-10):** 7 / 10  
  *(Lưu ý: 8-10: Tốt, 5-7: Có rủi ro nhưng kiểm soát được, \<5: Báo động đỏ cần PM hỗ trợ gấp).*

### **PHẦN 1: BÁO CÁO TIẾN ĐỘ THEO TỪNG KEY RESULT (KR)**

🎯 **\[KR 1.1\]: Đạt tối thiểu 01 video 1.000.000 views trên TikTok/Shorts (Dự án TVC & Chuỗi 33 Video).**

* **Tiến độ tuần trước:** 60%  
* **Tiến độ hiện tại (Sau khi cộng dồn):** 70%

**1\. Đã làm gì trong tuần qua?**

* **Dự án TVC:** Đã tiếp nhận feedback từ PM/BOD, hoàn thiện chỉnh sửa các hiệu ứng hậu kỳ cho bản Demo Ver 1 để chuẩn bị xuất bản Final.  
* **Chuỗi 33 Video TikTok:** Đã bắt đầu tiến hành sản xuất và đăng tải những video ngắn đầu tiên trên kênh TikTok.

**2\. Đánh giá mức độ ảnh hưởng đến KR:**

* Dự án đinh (TVC) sắp hoàn thiện 100%. Các video TikTok ngắn bắt đầu cắn đề xuất, kéo lại tương tác kênh và đóng góp thêm 5% tiến độ phủ sóng thương hiệu theo kế hoạch.  
* **3\. Thay đổi tiến độ:** \+ 10%

🎯 **\[KR 2.1\]: Đảm bảo SLA: 100% các yêu cầu ấn phẩm (Video Onboarding, Layout PDF Sale, Ads Creative) được hoàn thành đúng deadline.**

* **Tiến độ tuần trước:** 0%  
* **Tiến độ hiện tại (Sau khi cộng dồn):** 15%

**1\. Đã làm gì trong tuần qua?**

* Đã tiếp nhận yêu cầu từ đội Tech (Thái Phong) về việc sản xuất "Video hướng dẫn nhúng" dành cho tính năng Aha Block.  
* Đang lên kịch bản chi tiết và chuẩn bị quay màn hình/hướng dẫn.

**2\. Đánh giá mức độ ảnh hưởng đến KR:**

* Bắt đầu phát huy đúng vai trò "Xưởng sản xuất". Video này sẽ hỗ trợ trực tiếp đội Tech hoàn thiện luồng Onboarding siêu tốc cho khách hàng.  
* **3\. Thay đổi tiến độ:** \+ 15%

🎯 **\[KR 2.2\]: Ứng dụng AI Agent giúp tăng \[Y\] lần số lượng ấn phẩm phát hành mỗi tuần mà không tăng nhân sự.**

* **Tiến độ tuần trước:** 100%  
* **Tiến độ hiện tại (Sau khi cộng dồn):** 100%

**1\. Đã làm gì trong tuần qua?**

* Áp dụng triệt để AI (Weavy AI lên kịch bản, CapCut Pro xử lý hiệu ứng) vào chuỗi sản xuất video TikTok hàng ngày.

**2\. Đánh giá mức độ ảnh hưởng đến KR:**

* Giúp duy trì được tần suất ra video đều đặn mà các Editor không bị quá tải. Tiến độ hạ tầng AI đã hoàn thành nên tuần này duy trì ở mức 100%.  
* **3\. Thay đổi tiến độ:** 0%

### **PHẦN 2: CAM KẾT HÀNH ĐỘNG TUẦN TỚI (NEXT WEEK PLAN)**

| STT | Hạng mục (Epic/Campaign/Deal) | Cam kết đầu ra (Output cụ thể) | Deadline |
| :---- | :---- | :---- | :---- |
| 1 | \[MediaTask\] Video hướng dẫn Aha Block | Quay dựng xong và bàn giao file mp4 chuẩn cho đội Tech để nhúng vào hệ thống. | 14/04/2026 |
| 2 | \[MediaTask\] Dự án TVC Sự kiện | Chốt duyệt lần cuối cùng PM và xuất bản bản Final chính thức. | 13/04/2026 |
| 3 | \[MediaTask\] Sản xuất Video UGC | (Ngay khi nhận Brief đợt 2 từ Mkt) Đẩy mạnh sản xuất luồng video Ads kéo Lead. | 16/04/2026 |

### **PHẦN 3: RÀO CẢN & YÊU CẦU HỖ TRỢ (BLOCKERS) 🚨**

* **Khó khăn 1:** Đội Media vẫn đang phải chờ đợi Brief kịch bản chi tiết đợt 2 từ phòng Marketing cho luồng Performance Ads (UGC/Case Study) khiến việc phân bổ nguồn lực quay dựng bị đứt quãng.  
* **Yêu cầu hỗ trợ từ PM/Phòng ban khác:** Đề nghị PM đốc thúc Hà Canh (Mkt) bàn giao sớm các Brief này. Tránh tình trạng dồn kịch bản vào cuối Sprint khiến Media bị quá tải và vỡ SLA trả ấn phẩm.

*Xác nhận của Leader:* **Đoàn Thanh Long**

# Sale

# **WEEKLY CHECK-IN (SMIT OS)**

*(Tài liệu sử dụng trước buổi họp Saturday Sync hàng tuần)*

### **THÔNG TIN CHUNG**

* **Kỳ báo cáo:** Tuần 1 (Sprint 2\) \- Tháng 04 / 2026 (06/04 \- 12/04)  
* **Đội / Phòng ban:** Sales  
* **Người báo cáo (Leader):** Nguyễn Quân (PM kiêm nhiệm)  
* **Mức độ tự tin đạt OKRs Quý (1-10):** 9 / 10  
  *(Lưu ý: 8-10: Tốt, 5-7: Có rủi ro nhưng kiểm soát được, \<5: Báo động đỏ cần PM hỗ trợ gấp).*  
  *(Ghi chú: Tuần bùng nổ\! Đã chốt được Deal cực lớn, hiện chỉ tập trung toàn lực vào việc hỗ trợ Tech hoàn thiện tính năng Custom để khách ký HĐ và xuống tiền).*

### **PHẦN 1: BÁO CÁO TIẾN ĐỘ THEO TỪNG KEY RESULT (KR)**

🎯 **\[KR 1.1\]: Đóng góp trực tiếp đạt 4,5 Tỷ VNĐ tổng doanh thu toàn dự án.**

* **Tiến độ tuần trước:** 15%  
* **Tiến độ hiện tại (Sau khi cộng dồn):** 90%

**1\. Đã làm gì trong tuần qua?**

* **BÙNG NỔ DEAL NELLY:** Đã demo xong toàn bộ hệ thống. Khách hàng ĐỒNG Ý CHỐT gói All-in-One cho ngân sách khổng lồ **500 Tỷ VNĐ / 20.000 TKQC**.  
* Đã trao đổi hoàn tất các yêu cầu custom thêm của khách, tổng hợp đầy đủ thông tin về phần "Quản lý Page" để chuyển giao cho bộ phận Tech.  
* Theo sát tiến trình tự test của Anh Đức Anh Lê (Gói 10 tỷ).

**2\. Đánh giá mức độ ảnh hưởng đến KR:**

* Đây là cú hích lịch sử của dự án. Gần như đã hoàn thành mục tiêu doanh thu của không chỉ Quý 2 mà còn cả năm nếu Deal này chính thức giải ngân thành công.  
* **3\. Thay đổi tiến độ:** \+ 75%

🎯 **\[KR 1.2\]: \[INBOUND\] Chuyển đổi MQL \-\> SQL đạt \>40% và duy trì tổng giá trị Pipeline (7 ngày) luôn \> 500 triệu đồng.**

* **Tiến độ tuần trước:** 40%  
* **Tiến độ hiện tại (Sau khi cộng dồn):** 45%

**1\. Đã làm gì trong tuần qua?**

* Xử lý 100% Sub mới đăng ký từ sau Tết đến hiện tại (Nhận 24 sub mới trong tuần).  
* Tư vấn và sàng lọc, duy trì Tổng giá trị cơ hội bán hàng (Opportunities) của nhóm khách hàng phổ thông ở mức 450.000.000 VNĐ.

**2\. Đánh giá mức độ ảnh hưởng đến KR:**

* Phễu Inbound hoạt động trơn tru. Dù đang tập trung đánh "cá mập" nhưng AE vẫn đảm bảo Lead đổ về được chăm sóc ngay lập tức, không để tồn đọng.  
* **3\. Thay đổi tiến độ:** \+ 5%

🎯 **\[KR 1.3\]:** \[OUTBOUND\]: Đạt tối thiểu 30% doanh thu từ nguồn Sale tự chủ động tìm kiếm (Hunting) không phụ thuộc vào Marketing (so với doanh thu tổng 4,5 tỷ).

* **Tiến độ tuần trước:** 25%  
* **Tiến độ hiện tại (Sau khi cộng dồn):** 30%

**1\. Đã làm gì trong tuần qua?**

* Dọn dẹp sạch sẽ, xóa thông tin rác trên các Profile Facebook cá nhân để chuẩn bị hình ảnh chuyên nghiệp nhất.  
* Lấy khách hàng sub người nước ngoài (để lại email trên S-CRM), tra cứu chéo trên diễn đàn BlackHatWorld để tìm kiếm thông tin Telegram/Skype kết nối trực tiếp.  
* Up bài, daily story đều đặn 2 bài/ngày trên Zalo công việc.

**2\. Đánh giá mức độ ảnh hưởng đến KR:**

* Phễu Outbound đang chuyển dịch trọng tâm sang tìm kiếm khách Global (quốc tế). Các bước dọn dẹp profile và research chéo là nền tảng bắt buộc để out-reach hiệu quả.  
* **3\. Thay đổi tiến độ:** \+ 5%

### **PHẦN 2: CAM KẾT HÀNH ĐỘNG TUẦN TỚI (NEXT WEEK PLAN)**

| STT | Hạng mục (Epic/Campaign/Deal) | Cam kết đầu ra (Output cụ thể) | Deadline |
| :---- | :---- | :---- | :---- |
| 1 | \[Deal\] Hợp đồng Khách hàng Nelly | Thúc đẩy Tech hoàn thiện luồng Quản lý Page, tiến hành ký Hợp đồng và giải ngân. | 15/04/2026 |
| 2 | \[Deal\] Chốt Deal Đức Anh Lê | Xử lý các thắc mắc cuối cùng sau quá trình dùng thử để chốt gói 10 Tỷ. | 17/04/2026 |
| 3 | \[SaleTask\] Hunting Global | Bắt đầu tiếp cận và nhắn tin kịch bản Outbound cho khách hàng trên diễn đàn BlackHatWorld. | 18/04/2026 |

### **PHẦN 3: RÀO CẢN & YÊU CẦU HỖ TRỢ (BLOCKERS) 🚨**

* **Khó khăn 1:** Deal khổng lồ Nelly (500 Tỷ) hiện tại đã chốt mồm xong, nhưng điều kiện bắt buộc để ký Hợp đồng là hệ thống phải có tính năng "Quản lý Page & Agency Super Share" (tính năng custom thêm).  
* **Yêu cầu hỗ trợ từ PM/Phòng ban khác:** Yêu cầu đội Tech (Thái Phong, Giang Trường) dồn 200% nguồn lực để đẩy nhanh tiến độ nghiên cứu và Code API tính năng Quản lý Page. Khách hàng lớn không có nhiều sự kiên nhẫn, nếu Tech delay quá lâu deal này sẽ bị "nguội" và có nguy cơ rớt\!

*Xác nhận của Leader:* **Nguyễn Quân**

