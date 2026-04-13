# Tech\&Product

# **WEEKLY CHECK-IN (SMIT OS)**

*(Tài liệu sử dụng trước buổi họp Saturday Sync hàng tuần)*

### **THÔNG TIN CHUNG**

* **Kỳ báo cáo:** Tuần 1 \- Tháng 03 / 2026 (23/03 \- 29/03)  
* **Đội / Phòng ban:** Tech & Product  
* **Người báo cáo (Leader):** Nguyễn Thái Phong  
* **Mức độ tự tin đạt OKRs Quý (1-10):** \[ 9 \] / 10 *(Lưu ý: 8-10: Tốt, 5-7: Có rủi ro nhưng kiểm soát được, \<5: Báo động đỏ cần PM hỗ trợ gấp).*

### **PHẦN 1: BÁO CÁO TIẾN ĐỘ THEO TỪNG KEY RESULT (KR)**

🎯 **\[KR 1.1\]: Giảm tỷ lệ lỗi Proxy đầu vào xuống dưới 10% và đảm bảo thời gian đồng bộ TKQC lần đầu \< 24h.**

* **Tiến độ tuần trước:** \[ 0 \] %  
* **Tiến độ hiện tại (Sau khi cộng dồn):** \[ 50 \] %  
* **Đã làm gì trong tuần qua?**  
  * Tối ưu phía FE để xử lý triệt để lỗi Proxy đầu vào.  
  * Xử lý chia nhỏ các file JS (do dung lượng sau build quá lớn khiến máy cấu hình thấp load chậm).  
  * Chuyển đổi định dạng các file ảnh PNG nặng sang định dạng WebP tối ưu hơn.  
* **Đánh giá mức độ ảnh hưởng đến KR:**  
  * Giải quyết dứt điểm tình trạng khách hàng rớt mạng ở màn hình chờ đầu tiên. Lỗi load trang đã giảm mạnh xuống mức \<10% theo đúng mục tiêu.  
* **Thay đổi tiến độ:** \+ \[ 50 \] %

🎯 **\[KR 1.2\]: Xin cấp quyền và duy trì trạng thái uptime 99.9% của tối thiểu 03 App Facebook dự phòng.**

* **Tiến độ tuần trước:** \[ 0 \] %  
* **Tiến độ hiện tại (Sau khi cộng dồn):** \[ 25 \] %  
* **Đã làm gì trong tuần qua?**  
  * Gửi form xin cấp quyền lần 2 (từ thứ 7 ngày 22/03) cho 4 App Facebook dự phòng.  
  * Theo dõi trạng thái duyệt của Meta.  
* **Đánh giá mức độ ảnh hưởng đến KR:**  
  * Khởi tạo hạ tầng backup phòng ngừa rủi ro sập luồng đồng bộ tài khoản nếu App chính bị Meta khóa.  
* **Thay đổi tiến độ:** \+ \[ 25 \] %

🎯 **\[KR 1.4\]: Triển khai In-app Tracking thành công, ghi nhận đủ 100% dữ liệu drop-off trả về Dashboard.**

* **Tiến độ tuần trước:** \[ 0 \] %  
* **Tiến độ hiện tại (Sau khi cộng dồn):** \[ 40 \] %  
* **Đã làm gì trong tuần qua?**  
  * Đã đấu nối thành công PostHog vào hệ thống Front-End.  
  * Bật và theo dõi được các chỉ số web cùng tính năng Replay Session (xem lại thao tác user).  
* **Đánh giá mức độ ảnh hưởng đến KR:**  
  * Cung cấp số liệu và hình ảnh thực tế về luồng Onboarding của khách hàng để team Sale và MKT nắm bắt được hành vi rớt phễu.  
* **Thay đổi tiến độ:** \+ \[ 40 \] %

### **PHẦN 2: CAM KẾT HÀNH ĐỘNG TUẦN TỚI (NEXT WEEK PLAN)**

| STT | Hạng mục (Epic/Campaign/Deal) | Cam kết đầu ra (Output cụ thể) | Deadline |
| :---- | :---- | :---- | :---- |
| 1 | \[TechTask\] Xin quyền App FB v1 & v2 | Gửi video review và nhận quyền Ads Standard cho 2 app đầu. | 01/04/2026 |
| 2 | \[TechTask\] Xin quyền App FB v3 & v4 | Gửi xin quyền cách ngày cho 2 app còn lại để tránh bot Meta nghi ngờ. | 03/04/2026 |
| 3 | \[TechTask\] Tối ưu In-app Tracking | Bổ sung logic tracking để phân biệt được lỗi rớt mạng do server hay do mạng của khách hàng. | 04/04/2026 |

### **PHẦN 3: RÀO CẢN & YÊU CẦU HỖ TRỢ (BLOCKERS) 🚨**

* **Khó khăn 1:** Hệ thống Tracking (PostHog) mới gắn vào chưa bóc tách cụ thể được trường hợp người dùng bị lỗi load trang là do thiết bị/mạng của họ hay do hệ thống của mình.  
* **Yêu cầu hỗ trợ từ PM/Phòng ban khác:** Không có. (Team Tech sẽ tự research và fix phần bắt lỗi này trong tuần tới).

# Marketing

# **WEEKLY CHECK-IN (SMIT OS)**

*(Tài liệu sử dụng trước buổi họp Saturday Sync hàng tuần)*

### **THÔNG TIN CHUNG**

* **Kỳ báo cáo:** Tuần 1 \- Tháng 03 / 2026 (23/03 \- 29/03)  
* **Đội / Phòng ban:** Marketing  
* **Người báo cáo (Leader):** Hà Canh  
* **Mức độ tự tin đạt OKRs Quý (1-10):** \[ 8 \] / 10  
  *(Lưu ý: 8-10: Tốt, 5-7: Có rủi ro nhưng kiểm soát được, \<5: Báo động đỏ cần PM hỗ trợ gấp).*

### **PHẦN 1: BÁO CÁO TIẾN ĐỘ THEO TỪNG KEY RESULT (KR)**

🎯 **\[KR 1.2\]: Tìm ra tối thiểu 03 case quảng cáo Win (CTR ≥ 10%), kéo CPA trung bình giảm ≥ 15% so với Q1.**

* **Tiến độ tuần trước:** \[ 0 \] %  
* **Tiến độ hiện tại (Sau khi cộng dồn):** \[ 30 \] %

**1\. Đã làm gì trong tuần qua?**

* Rà soát toàn bộ chiến dịch Facebook Ads do nội dung cũ đang bị giảm hiệu quả.  
* Hoàn thành tái cơ cấu chiến dịch: Tạo lại creative mới và tập trung dồn ngân sách vào các nhóm quảng cáo còn duy trì được hiệu quả.  
* Đã lên tạm ứng ngân sách và chờ duyệt giải ngân cho kỳ quảng cáo 28/03 \- 12/04.

**2\. Đánh giá mức độ ảnh hưởng đến KR:**

* Dừng kịp thời việc "chảy máu" ngân sách vào các ads rác. Khung chiến dịch Q2 đã được định hình rõ ràng, tạo bước đệm vững chắc để test các case Win trong tuần tới.  
* **3\. Thay đổi tiến độ:** \+ \[ 30 \] %

🎯 **\[KR 1.1\]: Mang về 2.000 MQLs với tỷ lệ chuyển đổi MQL \-\> Signup duy trì ở mức tối thiểu 50%.**

* **Tiến độ tuần trước:** \[ 0 \] %  
* **Tiến độ hiện tại (Sau khi cộng dồn):** \[ 15 \] %

**1\. Đã làm gì trong tuần qua?**

* Hoàn thành xây dựng hạ tầng chuẩn bị cho chiến dịch UGC Review (Bao gồm hệ thống bảng quản lý và file Brief chi tiết).

**2\. Đánh giá mức độ ảnh hưởng đến KR:**

* Đã xây xong móng, chuẩn bị sẵn sàng vũ khí để bắt đầu khâu Outreach (liên hệ) các Creator/KOC nhằm tạo phễu thu Lead số lượng lớn.  
* **3\. Thay đổi tiến độ:** \+ \[ 15 \] %

### **PHẦN 2: CAM KẾT HÀNH ĐỘNG TUẦN TỚI (NEXT WEEK PLAN)**

| STT | Hạng mục (Epic/Campaign/Deal) | Cam kết đầu ra (Output cụ thể) | Deadline |
| :---- | :---- | :---- | :---- |
| 1 | \[Campaign\] Chiến dịch Facebook Ads | Nhận giải ngân và kích hoạt lại các chiến dịch đã tái cơ cấu để duy trì luồng Lead. | 31/03/2026 |
| 2 | \[MktTask\] Chiến dịch UGC Review | Hoàn thiện Brief chi tiết để bàn giao cho team Media và bắt đầu quá trình Outreach KOC. | 02/04/2026 |
| 3 | \[MktTask\] Setup Tracking hệ thống | Thúc đẩy team Design/Tech chốt khung Website, phục vụ gắn mã Tracking (GA4, Pixel). | 05/04/2026 |

### **PHẦN 3: RÀO CẢN & YÊU CẦU HỖ TRỢ (BLOCKERS) 🚨**

* **Khó khăn 1:** Website chính của hệ thống chưa hoàn thiện việc index và chưa có khung chuẩn, gây khó khăn và đình trệ hoàn toàn việc setup hệ thống Tracking đo lường luồng User.  
* **Yêu cầu hỗ trợ từ PM/Phòng ban khác:** Yêu cầu PM điều phối đội Tech & Product khẩn trương chốt hạ tầng web sớm để MKT có thể gắn mã tracking (GA4/Pixel) chuẩn bị cho các chiến dịch đổ traffic sắp tới.

*Xác nhận của Leader:* **Hà Canh**

# Media

# **WEEKLY CHECK-IN (SMIT OS)**

*(Tài liệu sử dụng trước buổi họp Saturday Sync hàng tuần)*

### **THÔNG TIN CHUNG**

* **Kỳ báo cáo:** Tuần 1 \- Tháng 03 / 2026 (23/03 \- 29/03)  
* **Đội / Phòng ban:** Media  
* **Người báo cáo (Leader):** Đoàn Thanh Long  
* **Mức độ tự tin đạt OKRs Quý (1-10):** 8 / 10  
  *(Lưu ý: 8-10: Tốt, 5-7: Có rủi ro nhưng kiểm soát được, \<5: Báo động đỏ cần PM hỗ trợ gấp).*

### **PHẦN 1: BÁO CÁO TIẾN ĐỘ THEO TỪNG KEY RESULT (KR)**

🎯 **\[KR 1.1\]: Đạt tối thiểu 01 video 1.000.000 views trên TikTok/Shorts (Dự án TVC Sự kiện).**

* **Tiến độ tuần trước:** 0%  
* **Tiến độ hiện tại (Sau khi cộng dồn):** 20%

**1\. Đã làm gì trong tuần qua?**

* Bắt tay vào giai đoạn Tiền kỳ (Pre-production).  
* Họp team và đã chốt xong Concept/Ý tưởng kịch bản cho dự án TVC Sự kiện trọng điểm của tháng tới.

**2\. Đánh giá mức độ ảnh hưởng đến KR:**

* Đã định hình được nội dung chủ đạo, tạo nền móng vững chắc chuẩn bị cho giai đoạn quay dựng.  
* **3\. Thay đổi tiến độ:** \+ 20%

🎯 **\[KR 2.2\]: Ứng dụng AI Agent giúp tăng \[Y\] lần số lượng ấn phẩm phát hành mỗi tuần mà không tăng nhân sự.**

* **Tiến độ tuần trước:** 0%  
* **Tiến độ hiện tại (Sau khi cộng dồn):** 50%

**1\. Đã làm gì trong tuần qua?**

* Đã lên danh sách, trình duyệt và được PM thông qua ngân sách (1.619.000đ) cho các phần mềm công cụ: VidIQ, CapCut Pro và Weavy AI.  
* Đang tiến hành thanh toán và kích hoạt tài khoản cho anh em trong đội.

**2\. Đánh giá mức độ ảnh hưởng đến KR:**

* Sẵn sàng hạ tầng công cụ quan trọng. Việc có CapCut Pro và AI sẽ giúp rút ngắn 70% thời gian hậu kỳ, biến Media thành "Xưởng sản xuất" đúng nghĩa trong các Sprint tới.  
* **3\. Thay đổi tiến độ:** \+ 50%

🎯 **\[KR 2.1\]: Đảm bảo SLA: 100% các yêu cầu ấn phẩm (Video Onboarding, Layout PDF Sale, Ads Creative) được hoàn thành đúng deadline.**

* **Tiến độ tuần trước:** 0%  
* **Tiến độ hiện tại (Sau khi cộng dồn):** 0%

**1\. Đã làm gì trong tuần qua?**

* Setup xong máy móc thiết bị, sẵn sàng nhân sự để quay dựng đợt 1 các Video Quảng cáo (UGC, Case Study).  
* Tuy nhiên hiện tại chưa bắt đầu làm được vì chưa có đầu vào.

**2\. Đánh giá mức độ ảnh hưởng đến KR:**

* Chưa có tác động vì Team đang trong trạng thái chờ (Standby).  
* **3\. Thay đổi tiến độ:** 0%

### **PHẦN 2: CAM KẾT HÀNH ĐỘNG TUẦN TỚI (NEXT WEEK PLAN)**

| STT | Hạng mục (Epic/Campaign/Deal) | Cam kết đầu ra (Output cụ thể) | Deadline |
| :---- | :---- | :---- | :---- |
| 1 | \[MediaTask\] Công cụ AI hậu kỳ | Hoàn tất mua sắm và bàn giao 100% tài khoản công cụ AI cho anh em trong đội sử dụng. | 31/03/2026 |
| 2 | \[MediaTask\] Dự án TVC Sự kiện | Tiến hành quay dựng và xuất bản Demo Ver 1 của TVC Sự kiện để PM duyệt. | 04/04/2026 |
| 3 | \[MediaTask\] Ấn phẩm Performance Ads | Nhận Brief UGC từ Marketing, lập tức triển khai tiền kỳ (tìm KOC, setup bối cảnh). | 05/04/2026 |

### **PHẦN 3: RÀO CẢN & YÊU CẦU HỖ TRỢ (BLOCKERS) 🚨**

* **Khó khăn 1:** Team Media đang bị trống việc ở mảng sản xuất Video Ads chuyển đổi. Trạng thái task hiện tại là **"Chưa bắt đầu"** do chưa nhận được Brief Kịch bản chi tiết & Yêu cầu sản xuất đợt 1 từ phòng Marketing.  
* **Yêu cầu hỗ trợ từ PM/Phòng ban khác:** Cần PM hối thúc phòng Marketing (Hà Canh) khẩn trương chốt và bàn giao Brief sang cho Media trong đầu tuần tới để Media kịp quay dựng luồng chạy ra Lead đầu tháng 4\.

*Xác nhận của Leader:* **Đoàn Thanh Long**

# Sale

# **WEEKLY CHECK-IN (SMIT OS)**

*(Tài liệu sử dụng trước buổi họp Saturday Sync hàng tuần)*

### **THÔNG TIN CHUNG**

* **Kỳ báo cáo:** Tuần 1 \- Tháng 03 / 2026 (23/03 \- 29/03)  
* **Đội / Phòng ban:** Sales  
* **Người báo cáo (Leader):** Nguyễn Quân (PM kiêm nhiệm)  
* **Mức độ tự tin đạt OKRs Quý (1-10):** 8 / 10  
  *(Lưu ý: 8-10: Tốt, 5-7: Có rủi ro nhưng kiểm soát được, \<5: Báo động đỏ cần PM hỗ trợ gấp).*  
  *(Ghi chú: Phễu Inbound đang rất tốt với nhiều Deal lớn, cần tập trung follow-up sát sao).*

### **PHẦN 1: BÁO CÁO TIẾN ĐỘ THEO TỪNG KEY RESULT (KR)**

🎯 **\[KR 1.2\]: \[INBOUND\] Chuyển đổi MQL \-\> SQL đạt \>40% và duy trì tổng giá trị Pipeline (7 ngày) luôn \> 500 triệu đồng.**

* **Tiến độ tuần trước:** 0%  
* **Tiến độ hiện tại (Sau khi cộng dồn):** 20%

**1\. Đã làm gì trong tuần qua?**

* Rà soát và xử lý thành công 70% data khách hàng mới/tồn đọng trên S-CRM từ sau đợt Tết.  
* Phân loại được tệp data rác (ấn nhầm từ Adscheck sang) và tệp khách hàng tiềm năng thực sự để chăm sóc (Care page, nhắn tin Zalo).

**2\. Đánh giá mức độ ảnh hưởng đến KR:**

* Dọn dẹp sạch sẽ phễu Inbound cũ, bảo vệ các Lead chất lượng không bị rơi rớt. Giữ cho chỉ số Pipeline luôn ở mức an toàn.  
* **3\. Thay đổi tiến độ:** \+ 20%

🎯 **\[KR 1.1\]: Đóng góp trực tiếp đạt 4,5 Tỷ VNĐ tổng doanh thu toàn dự án.**

* **Tiến độ tuần trước:** 0%  
* **Tiến độ hiện tại (Sau khi cộng dồn):** 10%

**1\. Đã làm gì trong tuần qua?**

* Tiếp cận, tiến hành Demo hệ thống và hướng dẫn dùng thử cho các khách hàng VIP:  
  * **Anh Đức Anh Lê:** Gói ngân sách 10 tỷ (All in One).  
  * **Anh Khương Lê:** Gói ngân sách 13 tỷ (All in One).  
* Xử lý và Demo các yêu cầu custom thêm cho **Deal Nelly** (Khách hàng cực lớn).

**2\. Đánh giá mức độ ảnh hưởng đến KR:**

* Tạo ra các cơ hội bán hàng (Opportunities) với giá trị khổng lồ. Dù chưa chốt thành doanh thu thực tế nhưng đây là tiền đề cực kỳ quan trọng để kích nổ doanh thu 4.5 Tỷ trong các tuần tiếp theo.  
* **3\. Thay đổi tiến độ:** \+ 10%

🎯 **\[KR 1.3\]: \[OUTBOUND\]: Đạt tối thiểu 30% doanh thu từ nguồn Sale tự chủ động tìm kiếm (Hunting) không phụ thuộc vào Marketing (so với doanh thu tổng 4,5 tỷ).**

* **Tiến độ tuần trước:** 0%  
* **Tiến độ hiện tại (Sau khi cộng dồn):** 15%

**1\. Đã làm gì trong tuần qua?**

* Ứng dụng AI: AE Nguyễn Nhung đã xây dựng hoàn thiện Gem AI hỗ trợ viết bài, soạn mail và dịch ngôn ngữ.  
* Lọc danh sách tệp khách hàng cũ đang dùng tốt để chuẩn bị gọi xin Referral (Cu2Cu).

**2\. Đánh giá mức độ ảnh hưởng đến KR:**

* Chuẩn bị xong "vũ khí" (Gem AI và data) để đánh tệp khách hàng ngoại quốc (trên diễn đàn BlackHatWorld) và khai thác mạng lưới giới thiệu ngay trong tuần tới.  
* **3\. Thay đổi tiến độ:** \+ 15%

### **PHẦN 2: CAM KẾT HÀNH ĐỘNG TUẦN TỚI (NEXT WEEK PLAN)**

| STT | Hạng mục (Epic/Campaign/Deal) | Cam kết đầu ra (Output cụ thể) | Deadline |
| :---- | :---- | :---- | :---- |
| 1 | \[Deal\] Đàm phán Khách hàng Nelly | Có câu trả lời dứt điểm về các yêu cầu custom để đưa khách vào giai đoạn thương lượng/chốt Hợp đồng. | 02/04/2026 |
| 2 | \[Deal\] Chăm sóc KH Khương Lê & Đức Anh Lê | Follow up sát quá trình khách tự test hệ thống, xử lý phản hồi để chốt deal. | 04/04/2026 |
| 3 | \[SaleTask\] Khai thác mạng lưới Referral | Gọi điện kịch bản Cu2Cu cho tệp khách hàng cũ đang hoạt động tốt. | 03/04/2026 |
| 4 | \[SaleTask\] Outbound & Social Selling | Đẩy mạnh tương tác profile Facebook, tiếp cận nguồn khách mới trên Zalo và BlackHatWorld. | 05/04/2026 |

### **PHẦN 3: RÀO CẢN & YÊU CẦU HỖ TRỢ (BLOCKERS) 🚨**

* **Khó khăn 1:** Deal "cá mập" Nelly đang bị khựng lại ở khâu đàm phán do khách có yêu cầu test thêm tính năng custom và phản hồi. Hiện tại Sale vẫn đang phải chờ đội Tech.  
* **Yêu cầu hỗ trợ từ PM/Phòng ban khác:** Yêu cầu Tech Leader (Thái Phong) ưu tiên test nốt các tính năng khách Nelly yêu cầu ngay trong ngày Thứ 2 tuần tới và feedback lại để Sale có cơ sở ép khách chốt deal.

*Xác nhận của Leader:* **Nguyễn Quân**

