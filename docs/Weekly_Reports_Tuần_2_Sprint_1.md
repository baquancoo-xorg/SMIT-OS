# Tech\&Product

# **WEEKLY CHECK-IN (SMIT OS)**

*(Tài liệu sử dụng cho buổi họp Saturday Sync hàng tuần)*

**THÔNG TIN CHUNG**

* **Kỳ báo cáo:** Tuần 2 \- Tháng 04 / 2026 (30/03 \- 05/04)  
* **Đội / Phòng ban:** Tech & Product  
* **Người báo cáo (Leader):** Nguyễn Thái Phong  
* **Mức độ tự tin đạt OKRs Quý (1-10):** \[ 8 \] / 10  
  *(Lưu ý: 8-10: Tốt, 5-7: Có rủi ro nhưng kiểm soát được, \<5: Báo động đỏ cần PM hỗ trợ gấp).*

## **PHẦN 1: BÁO CÁO TIẾN ĐỘ THEO TỪNG KEY RESULT (KR)**

### **🎯 \[KR 1.1\]: Giảm tỷ lệ lỗi Proxy đầu vào xuống dưới 10% và đảm bảo thời gian đồng bộ TKQC lần đầu \< 24h.**

* **Tiến độ tuần trước:** \[ 50 \] %  
* **Tiến độ hiện tại (Sau khi cộng dồn):** \[ 70 \] %

**1\. Đã làm gì trong tuần qua?**

* Xử lý triệt để 100% các trường hợp lỗi Proxy xuất phát từ phía Server của SMIT.

**2\. Đánh giá mức độ ảnh hưởng đến KR:**

* Đã gỡ được "nút thắt" lớn nhất của hệ thống. Hiện tại rủi ro rớt mạng chỉ còn nằm ở các trường hợp user sử dụng mạng lưới quá yếu. Hệ thống cơ bản đã đạt mức độ ổn định.  
* **3\. Thay đổi tiến độ:** \+ \[ 20 \] %

### **🎯 \[KR 1.2\]: Xin cấp quyền và duy trì trạng thái uptime 99.9% của tối thiểu 03 App Facebook dự phòng.**

* **Tiến độ tuần trước:** \[ 25 \] %  
* **Tiến độ hiện tại (Sau khi cộng dồn):** \[ 50 \] %

**1\. Đã làm gì trong tuần qua?**

* Xin thành công quyền Ads Standard cho App v1.  
* Xin quyền page\_metadata cho App v1 và gửi video xin quyền cho App v2.  
* Chuẩn bị làm video xin quyền cho App v3 và v4.

**2\. Đánh giá mức độ ảnh hưởng đến KR:**

* Quy trình xin cấp quyền đang được thực hiện nhỏ giọt, rải rác đúng chiến thuật để đảm bảo tỷ lệ duyệt của Meta và tránh bị đánh dấu spam.  
* **3\. Thay đổi tiến độ:** \+ \[ 25 \] %

### **🎯 \[KR 1.3\]: Release "Aha Block" và nút "Liên hệ Sale trực tiếp", đóng góp vào việc rút ngắn Time-to-value xuống 24h.**

* **Tiến độ tuần trước:** \[ 0 \] %  
* **Tiến độ hiện tại (Sau khi cộng dồn):** \[ 80 \] %

**1\. Đã làm gì trong tuần qua?**

* Code xong 100% UI và Logic API cho "Aha Block".  
* Đã Pass QA nội bộ (Môi trường Staging). Chỉ chờ Review cuối để Deploy.

**2\. Đánh giá mức độ ảnh hưởng đến KR:**

* Sẵn sàng đưa tính năng core lên môi trường thật, đóng góp trực tiếp vào mục tiêu tối ưu trải nghiệm Onboarding và giảm Time-To-Value cho user mới.  
* **3\. Thay đổi tiến độ:** \+ \[ 80 \] %

### **🎯 \[KR 1.4\]: Triển khai In-app Tracking thành công, ghi nhận đủ 100% dữ liệu drop-off trả về Dashboard.**

* **Tiến độ tuần trước:** \[ 40 \] %  
* **Tiến độ hiện tại (Sau khi cộng dồn):** \[ 50 \] %

**1\. Đã làm gì trong tuần qua?**

* Cập nhật thêm cơ chế Debug phía hệ thống cho PostHog.  
* Liên kết với đội MKT để lên danh sách các Event User cần tracking.

**2\. Đánh giá mức độ ảnh hưởng đến KR:**

* Hạ tầng tracking đã sẵn sàng. Tuy nhiên tiến độ tăng chậm do đang phải đợi chốt luồng UX từ phía Marketing mới có thể gắn event thực tế vào code.  
* **3\. Thay đổi tiến độ:** \+ \[ 10 \] %

### **🎯 \[KR 2.2\]: Code và bàn giao thành công nền tảng S-CRM v2 (Dashboard, Metric Realtime) cho đội Sale.**

* **Tiến độ tuần trước:** \[ 0 \] %  
* **Tiến độ hiện tại (Sau khi cộng dồn):** \[ 80 \] %

**1\. Đã làm gì trong tuần qua?**

* Hoàn thiện 80% logic và giao diện của module SMIT Chat.  
* Chỉ còn phần test các case sử dụng.

**2\. Đánh giá mức độ ảnh hưởng đến KR:**

* Bám sát tiến độ cam kết. Module Chat là tiền đề vô cùng quan trọng để tích hợp S-CRM v2.  
* **3\. Thay đổi tiến độ:** \+ \[ 80 \] %

## **PHẦN 2: CAM KẾT HÀNH ĐỘNG TUẦN TỚI (NEXT WEEK PLAN)**

| **STT** | **Hạng mục (Epic/Campaign/Deal)** | **Cam kết đầu ra (Output cụ thể)** | **Deadline** |

| 1 | \[Epic\] Tính năng Aha Block | Tiến hành Code Review cuối (Chủ Nhật) và Deploy chính thức lên Production. | 06/04/2026 |

| 2 | \[Epic\] Module SMIT Chat | Cập nhật bản MVP (Chiều T3). Hoàn thiện 100% cả trải nghiệm lẫn logic. | 09/04/2026 |

| 3 | \[TechTask\] Quản lý Page & Tỷ giá | Cắt giao diện (HTML/CSS) và bắt đầu đấu nối API cho tính năng. | 11/04/2026 |

| 4 | \[TechTask\] Xin quyền App FB | Tiếp tục follow và gửi yêu cầu cấp quyền cho các App v3, v4. | 11/04/2026 |

## **PHẦN 3: RÀO CẢN & YÊU CẦU HỖ TRỢ (BLOCKERS) 🚨**

* **Khó khăn 1:** Tính năng Tracking Event cho người dùng hiện đang bị kẹt do chưa có luồng Landing Page và Onboarding chi tiết.  
* **Yêu cầu hỗ trợ từ PM/Phòng ban khác:** Yêu cầu đội MKT (Hà Canh) khẩn trương chốt luồng UI/UX để Tech có cơ sở gắn mã Tracking Event. Cần PM (Quân) thúc đẩy.  
* 

# Marketing

# **WEEKLY CHECK-IN (SMIT OS)**

*(Tài liệu sử dụng trước buổi họp Saturday Sync hàng tuần)*

### **THÔNG TIN CHUNG**

* **Kỳ báo cáo:** Tuần 2 \- Tháng 04 / 2026 (30/03 \- 05/04)  
* **Đội / Phòng ban:** Marketing  
* **Người báo cáo (Leader):** Hà Canh  
* **Mức độ tự tin đạt OKRs Quý (1-10):** 6 / 10  
  *(Lưu ý: 8-10: Tốt, 5-7: Có rủi ro nhưng kiểm soát được, \<5: Báo động đỏ cần PM hỗ trợ gấp).*  
  *(Ghi chú: Đang có rủi ro lớn về chỉ số MQL và tiến độ chốt Website).*

### **PHẦN 1: BÁO CÁO TIẾN ĐỘ THEO TỪNG KEY RESULT (KR)**

🎯 **\[KR 1.2\]: Tìm ra tối thiểu 03 case quảng cáo Win (CTR ≥ 10%), kéo CPA trung bình giảm ≥ 15% so với Q1.**

* **Tiến độ tuần trước:** 30%  
* **Tiến độ hiện tại (Sau khi cộng dồn):** 45%

**1\. Đã làm gì trong tuần qua?**

* Hoàn thành rà soát và tái cơ cấu toàn bộ nội dung quảng cáo Facebook đang chạy.  
* Phân bổ lại ngân sách theo hiệu quả từng nhóm quảng cáo, loại bỏ dứt điểm các ads rác.  
* Đã xác định được **3 case nội dung Win** mang lại CPA ổn định trong khoảng 120K \- 150K.

**2\. Đánh giá mức độ ảnh hưởng đến KR:**

* Mục tiêu tìm Case Win đang đi đúng hướng (Đạt 45%). Việc giữ vững được 3 case này giúp kiểm soát CPA an toàn và là cơ sở để vít ngân sách trong các tuần tiếp theo.  
* **3\. Thay đổi tiến độ:** \+ 15%

🎯 **\[KR 1.1\]: Mang về 2.000 MQLs với tỷ lệ chuyển đổi MQL \-\> Signup duy trì ở mức tối thiểu 50%.**

* **Tiến độ tuần trước:** 15%  
* **Tiến độ hiện tại (Sau khi cộng dồn):** 38%

**1\. Đã làm gì trong tuần qua?**

* Chạy duy trì các chiến dịch thu Lead bằng các mẫu nội dung cũ và 3 case Win vừa tìm được.  
* Các luồng mới như chiến dịch UGC (KOC) và Retargeting vẫn đang ở giai đoạn đầu, chưa bung được số.

**2\. Đánh giá mức độ ảnh hưởng đến KR:**

* **Rủi ro lớn:** MQL hiện tại mới đạt mốc 38% (Chưa đạt kỳ vọng 50% theo tiến độ thời gian). Nếu không ép tiến độ luồng UGC và Retargeting, mục tiêu 2.000 MQLs của Quý sẽ bị vỡ.  
* **3\. Thay đổi tiến độ:** \+ 23%

🎯 **\[KR 2.1\]: Validate thành công 3 thị trường Global tiềm năng với mức ROI \> \[X\]%.**

* **Tiến độ tuần trước:** 0%  
* **Tiến độ hiện tại (Sau khi cộng dồn):** 20%

**1\. Đã làm gì trong tuần qua?**

* Đã hoàn thiện xong bảng Dự toán ngân sách cho chiến dịch Test thị trường nước ngoài.

**2\. Đánh giá mức độ ảnh hưởng đến KR:**

* Tiến độ đang **chậm**. Đã có dự toán nhưng vẫn chưa thể viết xong kế hoạch/brief chi tiết để triển khai thực tế. Cần tập trung giải quyết trong tuần sau.  
* **3\. Thay đổi tiến độ:** \+ 20%

### **PHẦN 2: CAM KẾT HÀNH ĐỘNG TUẦN TỚI (NEXT WEEK PLAN)**

| STT | Hạng mục (Epic/Campaign/Deal) | Cam kết đầu ra (Output cụ thể) | Deadline |
| :---- | :---- | :---- | :---- |
| 1 | \[MktTask\] Chốt luồng UI/UX Website | Hoàn thiện và chuẩn bị kỹ tài liệu (Tracking, CRO) để họp chốt dứt điểm khung Website với team Tech. | 08/04/2026 |
| 2 | \[Campaign\] Chiến dịch UGC (KOC) | Đẩy nhanh tiến độ booking KOC để sớm có video nguyên liệu đổ luồng Lead mới, bù đắp chỉ số MQL đang thiếu. | 09/04/2026 |
| 3 | \[MktTask\] Kế hoạch Test Global | Hoàn thiện bản kế hoạch chi tiết (Brief) và phương án test 3 thị trường Quốc tế. | 11/04/2026 |

### **PHẦN 3: RÀO CẢN & YÊU CẦU HỖ TRỢ (BLOCKERS) 🚨**

* **Khó khăn 1:** Tiến độ tối ưu Web & Tracking khách hàng (Thuộc O2) đang ở mức **0% (Chậm tiến độ nghiêm trọng)**. Toàn bộ các luồng cài cắm đo lường đang phụ thuộc hoàn toàn vào việc chốt khung Website SMIT.  
* **Yêu cầu hỗ trợ từ PM/Phòng ban khác:** Cuộc họp ngày 08/04 với đội Tech & Product là **Critical Path (Đường găng)**. Nếu trễ hoặc không chốt được khung Website trong buổi họp này, toàn bộ mục tiêu Tracking của Tháng 4 sẽ bị delay. Yêu cầu PM trực tiếp điều phối và ép deadline đội Tech (Thái Phong/Đăng Khoa).

*Xác nhận của Leader:* **Hà Canh**

# Media

# **WEEKLY CHECK-IN (SMIT OS)**

*(Tài liệu sử dụng trước buổi họp Saturday Sync hàng tuần)*

### **THÔNG TIN CHUNG**

* **Kỳ báo cáo:** Tuần 2 \- Tháng 04 / 2026 (30/03 \- 05/04)  
* **Đội / Phòng ban:** Media  
* **Người báo cáo (Leader):** Đoàn Thanh Long  
* **Mức độ tự tin đạt OKRs Quý (1-10):** 7 / 10  
  *(Lưu ý: 8-10: Tốt, 5-7: Có rủi ro nhưng kiểm soát được, \<5: Báo động đỏ cần PM hỗ trợ gấp).*  
  *(Ghi chú PM: Tự tin giảm nhẹ do phát sinh vấn đề ở khâu nhân sự VJ và áp lực deadline xử lý hậu kỳ TVC).*

### **PHẦN 1: BÁO CÁO TIẾN ĐỘ THEO TỪNG KEY RESULT (KR)**

🎯 **\[KR 1.1\]: Đạt tối thiểu 01 video 1.000.000 views trên TikTok/Shorts (Dự án TVC Sự kiện).**

* **Tiến độ tuần trước:** 20%  
* **Tiến độ hiện tại (Sau khi cộng dồn):** 60%

**1\. Đã làm gì trong tuần qua?**

* Hoàn thành toàn bộ khâu Tiền kỳ và Quay phim (Production) cho dự án TVC Sự kiện.  
* Hoàn thành xuất bản bản dựng nháp (Demo Ver 1\) để PM và các team cùng xem qua.

**2\. Đánh giá mức độ ảnh hưởng đến KR:**

* Dự án "đinh" của tháng đã thành hình, vượt qua được giai đoạn tốn kém và vất vả nhất là quay phim. Đang bám sát timeline dự kiến dù khâu hậu kỳ gặp chút rắc rối.  
* **3\. Thay đổi tiến độ:** \+ 40%

🎯 **\[KR 2.2\]: Ứng dụng AI Agent giúp tăng \[Y\] lần số lượng ấn phẩm phát hành mỗi tuần mà không tăng nhân sự.**

* **Tiến độ tuần trước:** 50%  
* **Tiến độ hiện tại (Sau khi cộng dồn):** 100%

**1\. Đã làm gì trong tuần qua?**

* Hoàn tất quá trình thanh toán, nâng cấp và bàn giao 100% tài khoản công cụ AI (VidIQ, CapCut Pro, Weavy AI) cho anh em trong đội.  
* Lên rule (quy tắc) sử dụng chung cho cả đội khi làm hậu kỳ.

**2\. Đánh giá mức độ ảnh hưởng đến KR:**

* Hạ tầng công cụ AI đã sẵn sàng 100%. Ngay lập tức áp dụng CapCut Pro vào việc hậu kỳ TVC giúp các Editor xử lý hiệu ứng nhanh hơn đáng kể.  
* **3\. Thay đổi tiến độ:** \+ 50%

🎯 **\[KR 2.1\]: Đảm bảo SLA: 100% các yêu cầu ấn phẩm (Video Onboarding, Layout PDF Sale, Ads Creative) được hoàn thành đúng deadline.**

* **Tiến độ tuần trước:** 0%  
* **Tiến độ hiện tại (Sau khi cộng dồn):** 0%

**1\. Đã làm gì trong tuần qua?**

* Tiếp tục Standby (Chờ đợi) để quay dựng đợt 1 Video UGC/Case Study quảng cáo.

**2\. Đánh giá mức độ ảnh hưởng đến KR:**

* Team Media đã chuẩn bị sẵn sàng nguồn lực máy móc, con người nhưng vẫn chưa thể bắt đầu do tắc nghẽn input từ phòng Marketing.  
* **3\. Thay đổi tiến độ:** 0%

### **PHẦN 2: CAM KẾT HÀNH ĐỘNG TUẦN TỚI (NEXT WEEK PLAN)**

| STT | Hạng mục (Epic/Campaign/Deal) | Cam kết đầu ra (Output cụ thể) | Deadline |
| :---- | :---- | :---- | :---- |
| 1 | \[MediaTask\] Dự án TVC Sự kiện | Sửa TVC theo feedback của PM/BOD và xuất bản bản Final chính thức. | 08/04/2026 |
| 2 | \[MediaTask\] Ấn phẩm Performance Ads | (Ngay khi nhận Brief từ Mkt) Tiến hành quay dựng ngay luồng video UGC kéo Lead. | 11/04/2026 |
| 3 | \[MediaTask\] Video TikTok Social | Lên plan chi tiết và sản xuất đều đặn nội dung ngắn cho chuỗi 33 video TikTok. | 12/04/2026 |

### **PHẦN 3: RÀO CẢN & YÊU CẦU HỖ TRỢ (BLOCKERS) 🚨**

* **Khó khăn 1:** Nhân sự VJ (Diễn viên quay) trong dự án TVC chưa thực sự chuyên nghiệp, dẫn đến việc phải quay đi quay lại nhiều lần, source bị lỗi nhiều làm khối lượng công việc hậu kỳ tăng vọt.  
* **Yêu cầu hỗ trợ từ PM/Phòng ban khác:** Đội Editor đang phải làm thêm giờ để xử lý source, mong PM thông cảm nếu thời gian chỉnh sửa các phiên bản Demo tiếp theo có độ trễ nhẹ. Đề xuất quy trình casting VJ chặt chẽ hơn cho các dự án sau.  
* **Khó khăn 2:** (Lặp lại tuần trước) Vẫn chưa nhận được Brief Kịch bản chi tiết nội dung UGC từ phòng Marketing.  
* **Yêu cầu hỗ trợ từ PM/Phòng ban khác:** Yêu cầu Hà Canh gửi Brief trước Thứ 3 tuần tới, nếu trễ hơn Media không cam kết kịp SLA trả file cuối tuần.

*Xác nhận của Leader:* **Đoàn Thanh Long**

# Sale

# **WEEKLY CHECK-IN (SMIT OS)**

*(Tài liệu sử dụng trước buổi họp Saturday Sync hàng tuần)*

### **THÔNG TIN CHUNG**

* **Kỳ báo cáo:** Tuần 2 \- Tháng 04 / 2026 (30/03 \- 05/04)  
* **Đội / Phòng ban:** Sales  
* **Người báo cáo (Leader):** Nguyễn Quân (PM kiêm nhiệm)  
* **Mức độ tự tin đạt OKRs Quý (1-10):** 8 / 10  
  *(Lưu ý: 8-10: Tốt, 5-7: Có rủi ro nhưng kiểm soát được, \<5: Báo động đỏ cần PM hỗ trợ gấp).*  
  *(Ghi chú: Đã có doanh thu thực tế đầu tiên, tuy nhiên một số Deal lớn đang trong giai đoạn dùng thử gặp rủi ro rớt phễu).*

### **PHẦN 1: BÁO CÁO TIẾN ĐỘ THEO TỪNG KEY RESULT (KR)**

🎯 **\[KR 1.2\]: \[INBOUND\] Chuyển đổi MQL \-\> SQL đạt \>40% và duy trì tổng giá trị Pipeline (7 ngày) luôn \> 500 triệu đồng.**

* **Tiến độ tuần trước:** 20%  
* **Tiến độ hiện tại (Sau khi cộng dồn):** 40%

**1\. Đã làm gì trong tuần qua?**

* Xử lý dứt điểm 95% khách hàng Sub cũ còn tồn đọng trên S-CRM.  
* Phân loại sâu tệp khách: Lọc ra các khách hàng chỉ ấn nhầm từ Adscheck sang và tìm ra những khách thực sự quan tâm tính năng cốt lõi (như Backup dữ liệu, Gửi thông báo mất quyền).

**2\. Đánh giá mức độ ảnh hưởng đến KR:**

* Hoàn tất việc "dọn rác" phễu Inbound. Việc phân loại chuẩn xác giúp AE tiết kiệm thời gian, tập trung chăm sóc các SQL (Sales Qualified Leads) có chất lượng cao thực sự.  
* **3\. Thay đổi tiến độ:** \+ 20%

🎯 **\[KR 1.1\]: Đóng góp trực tiếp đạt 4,5 Tỷ VNĐ tổng doanh thu toàn dự án.**

* **Tiến độ tuần trước:** 10%  
* **Tiến độ hiện tại (Sau khi cộng dồn):** 15%

**1\. Đã làm gì trong tuần qua?**

* **Chốt Deal đầu tiên:** Anh Sơn (Trust Mind Agency) mua gói Finance 1 tháng (45.120.000 VNĐ) để test hệ thống. Ngân sách dự kiến 80 Tỷ.  
* **Chăm sóc Deal lớn:** Gọi tư vấn sâu cho Anh Đăng (Ngân sách 10 Tỷ/tháng). Theo sát tiến độ dùng thử của đội Marketing bên anh Minh (Deal 40 Tỷ).  
* **Deal Nelly:** Vẫn duy trì liên lạc chờ Tech hoàn thiện tính năng để chốt.

**2\. Đánh giá mức độ ảnh hưởng đến KR:**

* Phát súng doanh thu đầu tiên đã nổ, tạo động lực lớn cho team. Các "cá mập" chục tỷ vẫn đang được giữ ấm trong Pipeline chờ ngày thu hoạch.  
* **3\. Thay đổi tiến độ:** \+ 5%

🎯 **\[KR 1.3\]:** \[OUTBOUND\]: Đạt tối thiểu 30% doanh thu từ nguồn Sale tự chủ động tìm kiếm (Hunting) không phụ thuộc vào Marketing (so với doanh thu tổng 4,5 tỷ).

* **Tiến độ tuần trước:** 15%  
* **Tiến độ hiện tại (Sau khi cộng dồn):** 25%

**1\. Đã làm gì trong tuần qua?**

* Liên hệ lại danh sách 8 khách hàng cũ qua Zalo, kết nối và hỗ trợ thành công 1 khách.  
* Tăng cường tương tác trên kênh Facebook cá nhân (kết bạn đạt \>1000 người, tối ưu profile chuẩn hóa).  
* Chuẩn bị phương án và kịch bản lên forum BlackHatWorld.

**2\. Đánh giá mức độ ảnh hưởng đến KR:**

* Tạo dựng hình ảnh chuyên gia (Social Selling) để tăng độ uy tín khi tiếp cận khách hàng lạ. Phễu Outbound bắt đầu có những viên gạch đầu tiên.  
* **3\. Thay đổi tiến độ:** \+ 10%

### **PHẦN 2: CAM KẾT HÀNH ĐỘNG TUẦN TỚI (NEXT WEEK PLAN)**

| STT | Hạng mục (Epic/Campaign/Deal) | Cam kết đầu ra (Output cụ thể) | Deadline |
| :---- | :---- | :---- | :---- |
| 1 | \[Deal\] Chốt hợp đồng Nelly | Nhận thông tin Tech hoàn tất test và ép khách hàng ký hợp đồng chính thức (Gói All-in-One). | 08/04/2026 |
| 2 | \[Deal\] Follow-up Deal 40 Tỷ (Anh Minh) | Tìm cách thuyết phục và hỗ trợ trực tiếp nhân sự của khách hàng dùng thử các tính năng lõi để thấy giá trị. | 10/04/2026 |
| 3 | \[SaleTask\] Hunting BlackHatWorld | Tìm kiếm tối thiểu 30 KH mới trên forum BHW, liên hệ test thử kịch bản email/chat với 5 KH đầu tiên. | 11/04/2026 |
| 4 | \[SaleTask\] Kịch bản KH mới | Hoàn thiện và tối ưu hóa 100% kịch bản liên hệ khách hàng Inbound mới. | 07/04/2026 |

### **PHẦN 3: RÀO CẢN & YÊU CẦU HỖ TRỢ (BLOCKERS) 🚨**

* **Khó khăn 1:** Khách hàng Anh Minh (Deal 40 tỷ) đang cho nhân sự dùng thử nhưng chỉ sử dụng mỗi tính năng "Gửi thông báo", phản hồi hiện tại là "không mặn mà lắm" và nguy cơ cao rớt deal.  
* **Yêu cầu hỗ trợ từ PM/Phòng ban khác:** Cần PM và Tech (Thái Phong) có phương án tung ra "Aha Block" sớm nhất có thể, hoặc hỗ trợ một luồng Demo tính năng cốt lõi (Backup dữ liệu) thật mượt mà để Sale có cớ gọi lại "kích thích" khách hàng này.

*Xác nhận của Leader:* **Nguyễn Quân**

