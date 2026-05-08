# SMIT Master Plan — Chuẩn Bị Đưa Sản Phẩm Ra Quốc Tế

**Mục tiêu cuối**: Đưa SMIT ra 5 thị trường nước ngoài (Trung Quốc, Ấn Độ, UAE, Ukraine, Nga).

**Nhưng trước khi ra ngoài**, phần mềm phải tự đứng vững được. File này tập trung 4 tuần đầu tiên (gọi là **Phase 0 — Cổng PLG**) gồm 3 sub-plan quan trọng nhất: **Sub-Plan 0 + Sub-Plan 1 + Sub-Plan 5**.

3 sub-plan này phải xong trước thì mới được phép launch quốc tế. Đây là điều kiện cứng.

---

## Phần 1 — 3 Vấn Đề Lớn Đang Cản Trở SMIT Ra Nước Ngoài

### Vấn đề 1: Phần mềm chưa tự đi được, vẫn phụ thuộc Sale

**Hiện trạng đang xảy ra**:
- User Việt khi gặp khó khăn add tài khoản → Sale gọi điện/nhắn Zalo hỗ trợ
- Nhờ có Sale "rescue" này nên user mới chuyển đổi được
- Phần mềm SMIT một mình, không có Sale, **chưa đủ khả năng tự dẫn dắt user**

**Hậu quả nếu không sửa trước khi ra nước ngoài**:
- User ở Trung Đông, Ấn Độ, Trung Quốc... không có Sale local nào để rescue lúc 3h sáng giờ họ
- User nước ngoài stuck → không có ai hỗ trợ → bỏ ngay
- Tỷ lệ chuyển đổi quốc tế sẽ tệ hơn VN nhiều
- Pilot quốc tế Phase 1 (ngân sách 600-900tr) vỡ → lãng phí lớn

### Vấn đề 2: 70% user đăng ký xong KHÔNG add tài khoản (= không dùng phần mềm)

**Hiện trạng đang xảy ra (data thật)**:
- Mỗi tháng có khoảng 100-500 user đăng ký SMIT
- Chỉ ~30% trong số đó thực sự add tài khoản QC đầu tiên (= bắt đầu dùng phần mềm)
- 70% còn lại đăng ký xong → bỏ luôn, không add tài khoản nào

**Lý do user không add tài khoản** (đã xác nhận với MKT Lead):
- **Tò mò**: đăng ký xem cho biết, chưa có ý định dùng thật
- **Không hiểu giá trị**: đăng ký xong không biết làm gì tiếp, không hiểu phần mềm giúp được gì

**Hậu quả**:
- Tiền chạy quảng cáo cho 70 user trên mỗi 100 user coi như đốt
- Pre-PQL rate (tỷ lệ user thực sự bắt đầu dùng) chỉ 30% → quá thấp
- Khi ra nước ngoài, tỷ lệ này sẽ còn tệ hơn (do mất lợi thế brand local + Sale local)

### Vấn đề 3: Đội Sale 1-2 người không đủ scale khi tăng volume

**Hiện trạng đang xảy ra**:
- Hiện chỉ có 1-2 Sale làm tất cả: qualify + demo + chốt deal + onboard + support
- Sale chốt được hơn 50% deal lớn (>50 triệu) → đây là đòn bẩy doanh thu mạnh nhất

**Hậu quả khi scale**:
- Khi tăng từ 14 order/tháng lên 50 order/tháng → 1-2 Sale quá tải
- Sale phân tâm sang support nhỏ → giảm thời gian chốt deal lớn → vỡ doanh thu
- Không có ai làm onboarding cho khách mới → khách dùng không hiểu → churn (bỏ phần mềm) cao
- Ra nước ngoài: nhân lên 5 thị trường → vỡ trận hoàn toàn

---

## Phần 2 — 3 Giải Pháp Cho 3 Vấn Đề Trên

### Giải pháp 1 → Sub-Plan 0: Lắp Hệ Thống Đo Lường

#### Tại sao cần?
Hiện tại không biết chính xác:
- 70% user bỏ ở **bước nào**? Đăng ký? Đăng nhập? Hay khi vào màn add tài khoản?
- **Cách đánh nào** thực sự work, cách nào không?
- Khi ra nước ngoài, **thị trường nào** có signal tốt nhất để đầu tư tiếp?

→ Không đo lường = tối ưu mù = lãng phí thời gian và tiền.

#### Cách làm cụ thể
Dùng PostHog (công cụ đo đã có sẵn) để theo dõi 65 sự kiện qua 7 giai đoạn của user:

| Giai đoạn | Mô tả |
|---|---|
| 1. ATTRACT | User thấy quảng cáo (paid ads, banner Ads Check, link giới thiệu) |
| 2. SIGN-UP | User đăng ký account |
| 3. PRE-PQL | User add tài khoản QC đầu tiên ← **bottleneck chính** |
| 4. PQL | User dùng feature core ≥3 lần/7 ngày → có khả năng trả tiền |
| 5. PURCHASE | User thanh toán mua gói |
| 6. EXPAND | User upgrade gói (lên 12 tháng, thêm acc, thêm seat) |
| 7. ADVOCATE | User giới thiệu khách mới (Cu2Cu) |

Build 4 dashboard PostHog để xem hằng tuần:
1. **Executive** — cho cấp trên xem tổng quan doanh thu + funnel
2. **Funnel** — xem user rơi rớt ở giai đoạn nào
3. **Cohort** — theo dõi user theo tuần đăng ký, giữ chân được bao lâu
4. **Channel Attribution** — kênh nào (Ads Check, Paid Ads, Referral) hiệu quả nhất

#### Kết quả mong đợi sau Tuần 3
- Biết chính xác Pre-PQL rate hiện tại = bao nhiêu (không còn ước "khoảng 30%")
- Biết user drop-off cụ thể ở step nào → biết tactic nhắm vào đâu
- Có dashboard real-time, mọi quyết định đều dựa trên data
- A/B test framework sẵn sàng (qua PostHog feature flag)
- **Đây là điều kiện bắt buộc** trước khi launch Sub-Plan 1, 5, hoặc ra nước ngoài

---

### Giải pháp 2 → Sub-Plan 1: Sửa Nút Thắt "User Không Add Tài Khoản"

#### Tại sao cần?
Đây là bottleneck tốn nhiều tiền nhất hiện nay. Mỗi 1% Pre-PQL rate cải thiện = nhân toàn bộ pipeline phía sau (PQL, Purchase, Renewal, Referral).

**Mục tiêu**: Tăng Pre-PQL rate từ **30% lên 45-60%** trong 4-12 tuần.

#### 5 cách đánh để giải nút thắt

##### Cách 1 — Demo Preview (cho user xem trước kết quả)

**Vấn đề giải**: User không hiểu giá trị → bỏ.

**Cách làm**:
- Trên màn add tài khoản, thêm section "Xem trước kết quả"
- Hiển thị 3-5 ảnh chụp dashboard SMIT thực tế (đã ẩn data thật)
- Có 1 video walkthrough <60 giây
- CTA dưới: "Add tài khoản của bạn để xem dashboard tương tự"

**Kết quả mong đợi**: User thấy giá trị TRƯỚC khi cam kết → chịu add tài khoản.

##### Cách 2 — Email/Zalo Nhắc Tự Động

**Vấn đề giải**: User đăng ký xong rời app, không có ai nhắc lại.

**Cách làm** (3 lần nhắc tự động):
- **Sau 24 giờ chưa add**: Gửi email/Zalo "3 phút để add tài khoản đầu" + link video
- **Sau 72 giờ vẫn chưa add**: Gửi với câu chuyện 1 agency tương tự đã giải pain
- **Sau 7 ngày vẫn chưa add**: Gửi lần cuối + trigger Sale gọi (Cách 4)

**Kết quả mong đợi**: Bắt được user còn ý định dùng nhưng quên/bận.

##### Cách 3 — Tooltip + FAQ Trấn An Bảo Mật

**Vấn đề giải**: User lo "đưa tài khoản QC cho SMIT có nguy hiểm không, có bị mất acc không".

**Cách làm**:
- Thêm tooltip ngay nút "Add tài khoản": "SMIT chỉ đọc data, không can thiệp acc, có thể remove bất cứ lúc nào"
- Có link "Đọc thêm FAQ" → mở trang FAQ 1 trang về bảo mật

**Kết quả mong đợi**: User yên tâm hơn → vượt qua tâm lý lo lắng để add tài khoản.

##### Cách 4 — Concierge: Sale gọi user stuck >7 ngày

**Vấn đề giải**: Có user thật sự muốn dùng nhưng kẹt technical, không tự giải được.

**Cách làm**:
- Sau 7 ngày user đăng ký mà chưa add tài khoản → tự động trigger task cho Sale
- Sale (1-2 người hiện tại) gọi/nhắn Zalo 5 phút: "Anh/em có gặp khó khăn gì khi setup không? Mình demo nhanh"
- Sale ghi nhận kết quả: thành công / không phản hồi / từ chối

**Kết quả mong đợi**: Bắt được 30-50% user stuck thật (không phải tò mò), giải pain cá nhân hóa.

##### Cách 5 — Add Tài Khoản 1 Click Qua OAuth (Nếu Khả Thi)

**Vấn đề giải**: Flow add tài khoản nhiều bước → user nản.

**Cách làm**:
- Tech Lead audit flow add tài khoản hiện tại
- Nếu khả thi: build OAuth với Meta/Google → user click 1 lần authorize là xong (không cần copy/paste token)
- Track flow nào user dùng: manual (cũ) hay OAuth (mới)

**Kết quả mong đợi**: Giảm thời gian add từ ~15 phút xuống ~2 phút → giảm friction lớn.

#### Kết quả tổng Sub-Plan 1
- **Sau 4 tuần (Phase 1)**: Pre-PQL rate **30% → 45%**
- **Sau 12 tuần (Phase 3 dài hạn)**: Pre-PQL rate **45% → 55-60%**
- Thời gian từ đăng ký → add tài khoản (Time-to-Activate) giảm 50%
- Là điều kiện bắt buộc trước khi launch quốc tế (vì international không có Sale rescue)

---

### Giải pháp 3 → Sub-Plan 5: Phân Vai Sale + Build Hệ Thống Tự Phục Vụ

#### Tại sao cần?
- 1-2 Sale hiện tại không đủ để scale lên 50 order/tháng
- Ra nước ngoài: không có Sale local → user phải tự đọc tự hiểu → cần hệ thống self-serve mạnh
- Khách Pro/Elite (gói cao) cần support nhanh, khách Free/Trial dùng được self-serve là OK

#### Cách làm (gồm 2 phần A và B)

##### Phần A — Phân vai 2 Sale hiện tại

| Vai mới | Người | Trách nhiệm chính | Phân bổ thời gian |
|---|---|---|---|
| Deal Concierge | Sale 1 (top closer) | **Chỉ focus deal >50 triệu** (Enterprise, Pro 12M) | 80% Concierge / 20% support escalation |
| Customer Onboarding & Success | Sale 2 | Onboarding khách mới theo nghiệp vụ ICP, chống churn | 60% Onboarding / 40% CS + churn prevent |

→ Sale 1 được "khoá" 80% time vào Concierge → KHÔNG cho phân tâm sang support nhỏ → bảo vệ doanh thu deal lớn.

##### Phần B — Build hệ thống Tự Phục Vụ (3 cấu phần)

###### B.1 — Help Center (trang user tự đọc)

- **50+ câu FAQ** chia theo 4 nhóm: kỹ thuật, pháp lý, billing, security
- **10-15 video hướng dẫn** <3 phút mỗi video (1 task = 1 video, ví dụ "Cách add tài khoản đầu", "Cách generate báo cáo", "Cách set cảnh báo")
- **3 bộ HDSD theo nghiệp vụ ICP**:
  - Rental-only agency (chuyên cho thuê acc QC)
  - Running-ads agency (chuyên chạy thuê QC)
  - Hybrid (cả 2)
- **Trang "What's new"** thông báo update phần mềm

###### B.2 — Bot tier-1 (đơn giản, không cần AI)

- 30-50 câu hỏi pattern phổ biến → bot trả lời ngay
- Bot không giải được → tự động escalate sang Sale 2 (CS) hoặc Sale 1 (Concierge) tùy gói khách
- Tooling gợi ý: Intercom Resolution Bot / Crisp / hoặc tự build (free tier đủ)

###### B.3 — Tier-based Support (phân cấp hỗ trợ theo gói)

| Gói khách | Kênh support | Thời gian phản hồi |
|---|---|---|
| Free / Trial 14 ngày | Bot + Help center tự đọc | Bot trả lời ngay |
| Finance / Operation (9.36tr/tháng) | Bot + Ticket async (Zalo/email) | <24 giờ |
| Professional (15.6tr/tháng) | Bot + Sync chat trong app | <2 giờ giờ làm |
| Elite (31.2tr/tháng) | Sync chat + Concierge dedicated | <30 phút giờ làm |

→ Khách trả nhiều = support nhanh hơn. Khách Free dùng tự phục vụ.

#### Kết quả mong đợi sau 4 tuần
- Sale 1 dồn 80% time vào Concierge → bảo vệ tỷ lệ thắng deal >50tr ≥50% (giữ baseline)
- Sale 2 onboarding khách mới → tỷ lệ Pre-PQL → PQL tăng +20%
- Help Center + Bot xử lý ≥60% câu hỏi tự động (không cần người)
- Khi launch quốc tế: user nước ngoài có đủ tài liệu/bot tự phục vụ → KHÔNG cần Sale local rescue

---

## Phần 3 — Kết Quả Tổng Khi 3 Sub-Plan Này Xong (Sau 4 Tuần)

### Cho thị trường VN (giữ baseline + tối ưu)
- Pre-PQL rate: **30% → 45%** (Phase 1 ngắn hạn)
- Sale 1+2 specialize → bảo vệ doanh thu deal lớn
- Self-serve infra giảm 60% workload support cho team
- Baseline doanh thu ~427 triệu/tháng được giữ vững + có dư địa tăng thêm

### Cho việc ra quốc tế (lý do quan trọng nhất)
- ✅ Phần mềm self-serve đủ tốt → user nước ngoài tự dùng được
- ✅ Có dashboard đo lường để biết market nào có signal tốt
- ✅ Khi mở 5 markets quốc tế (Trung Quốc / Ấn Độ / UAE / Ukraine / Nga), không bị vỡ vì user stuck mà không có ai support
- ✅ **Đây là điều kiện đủ (gọi là PLG Gate) để bắt đầu Phase 1 international**

### Checklist 12 điều kiện cần đạt cuối Tuần 4 (PLG Gate)

Phải pass đủ 12 điều mới được phép launch quốc tế:

| # | Điều kiện | Sub-Plan owner |
|---|---|---|
| 1 | Pre-PQL rate ≥ 45% | Sub-Plan 1 |
| 2 | Tỷ lệ hoàn thành onboarding in-app ≥ 80% | Sub-Plan 1 |
| 3 | Help center có 50+ câu FAQ live | Sub-Plan 5 |
| 4 | Có 10-15 video hướng dẫn live | Sub-Plan 5 |
| 5 | Bot xử lý ≥40% câu hỏi tự động (không escalate) | Sub-Plan 5 |
| 6 | PostHog tracking 65 event đã verify đầy đủ | Sub-Plan 0 |
| 7 | Stripe đã test multi-currency (USD/EUR/INR/AED) | International |
| 8 | UI tiếng Anh đã được người bản xứ review | International |
| 9 | Pricing page có sẵn 5 currency | International |
| 10 | HDSD theo ICP đủ 3 phiên bản (rental/running/hybrid) | Sub-Plan 5 |
| 11 | Email onboarding sequence tiếng Anh sẵn sàng | International |
| 12 | Flow trial → paid <10 phút (không cần Sale touch) | Existing + verify |

**Quy tắc quyết định cuối Tuần 4**:
- 12/12 ✅ → **GO Phase 1 international** (Tuần 5+)
- 8-11/12 ✅ → **GO có điều kiện** kèm mitigation plan cho items chưa pass
- <8/12 ✅ → **DEFER international** thêm 2-4 tuần để fix items thiếu

---

## Phần 4 — Thứ Tự Thực Hiện 4 Tuần (Phase 0 PLG Gate)

### Tuần 1 — Đo baseline + Bắt đầu chuẩn bị

| Việc | Ai làm | Output |
|---|---|---|
| Workshop định nghĩa 65 event + KPI | Tech Lead + MKT Lead | Schema + KPI doc lock |
| Tech Lead instrument 4 event cốt lõi (signup, add tài khoản, fail, login) | Tech Lead | Có Pre-PQL baseline thực tế |
| MKT chuẩn bị asset Cách 1.1 Demo Preview (ảnh + video) | MKT Lead + Designer | 3-5 ảnh + 1 video <60s |
| MKT chuẩn bị template email/Zalo nhắc | MKT Lead | 3 template (24h/72h/7d) |

→ **Cuối Tuần 1**: Đã đo được Pre-PQL rate baseline thực tế.

### Tuần 2 — Launch nửa Sub-Plan 1 + Bắt đầu Sub-Plan 5

| Việc | Ai làm | Output |
|---|---|---|
| Tech Lead instrument event v2 (demo preview, tooltip, nudge) | Tech Lead | 8 event mới live |
| Launch Demo Preview + Tooltip live trong app | MKT + Designer + Tech | Cách 1.1 + 1.3 active |
| Setup automation email/Zalo nudge | MKT Lead | Cách 1.2 active |
| Bắt đầu viết HDSD theo ICP (3 phiên bản) | MKT Lead | 3 doc draft |
| Tech Lead audit flow add tài khoản, đánh giá OAuth khả thi | Tech Lead | Quyết định Cách 1.5 GO/NO |

→ **Cuối Tuần 2**: Cách 1.1 + 1.2 + 1.3 đã live. Có A/B test data đầu tiên để tinh chỉnh.

### Tuần 3 — Hoàn thiện Sub-Plan 5 self-serve infra

| Việc | Ai làm | Output |
|---|---|---|
| Build Bot tier-1 + Help Center (50+ FAQ) | Tech Lead + MKT | Help center live |
| Quay 10-15 video hướng dẫn | Video Editor | Video library |
| Setup Concierge fallback workflow + script Sale | MKT + Sale Lead | Cách 1.4 active |
| Build 4 PostHog dashboard | MKT Lead + Tech Lead | Executive/Funnel/Cohort/Attribution |
| Sale 1 chuyển 80% time sang Concierge focus | Sale Lead | Phân vai active |

→ **Cuối Tuần 3**: Sub-Plan 5 self-serve infra live, Sub-Plan 0 dashboard live.

### Tuần 4 — Test + Verify PLG Gate

| Việc | Ai làm | Output |
|---|---|---|
| UI tiếng Anh polish + native English review | Tech + Outsource native | UI EN ready |
| Pricing page localized 5 currency | Tech + MKT | 5 currency live |
| Stripe multi-currency test | Tech Lead | Payment quốc tế OK |
| Internal test toàn bộ flow + verify 12 checklist items | Cả team | PLG Gate report |
| Sign-off PLG Gate Decision | MKT Lead + CEO | Quyết định GO/DEFER |

→ **Cuối Tuần 4**: 12/12 checklist pass → **GO international Phase 1** (Tuần 5+).

---

## Phần 5 — Resource + Ngân Sách

### Resource cần lock 4 tuần

| Vai trò | Phân bổ thời gian | Ghi chú |
|---|---|---|
| Tech Lead | **80%** (gần như toàn thời gian) | Critical — không có Tech Lead, Phase 0 vỡ |
| MKT Lead | **50%** (nửa thời gian) | Orchestrate, content writing |
| Sale 1 (Concierge) | 80% Concierge mode | Lock không phân tâm |
| Sale 2 (Customer Success) | 100% chuyển sang Onboarding | Đào tạo lại role |
| Video Editor | Outsource theo project | 10-15 video × 5-7 ngày |
| Designer | Internal hoặc outsource | Visual cho Demo Preview, FAQ card, tooltip |
| Native English Reviewer | Outsource 1 lần | 5-10tr review UI EN |

### Ngân sách Phase 0 (4 tuần)

| Hạng mục | Chi phí |
|---|---|
| Sub-Plan 0 Đo lường (PostHog free tier + setup tools) | 10-15 triệu |
| Sub-Plan 1 Asset (Demo preview screenshot + video, tooltip, microcopy, email template) | 15-20 triệu |
| Sub-Plan 5 Self-serve infra (Help Center build, 10-15 video tutorial, bot setup) | 30-50 triệu |
| UI tiếng Anh polish + native English review | 5-10 triệu |
| **Tổng Phase 0** | **65-95 triệu** |

→ Đầu tư 65-95 triệu trong 4 tuần để giữ baseline VN + chuẩn bị quốc tế. Sau Phase 0, Phase 1 international cần thêm budget ~600-900 triệu cho 5 markets.

---

## Phần 6 — Quyết Định Cấp Trên Cần Xác Nhận

| # | Quyết định | Khuyến nghị của tôi |
|---|---|---|
| 1 | Lock Tech Lead 80% × 4 tuần cho Phase 0 | **PHẢI có** — không có Tech Lead, Phase 0 vỡ |
| 2 | Phân vai Sale 1 = Concierge (80%), Sale 2 = CS+Onboarding (100%) | **NÊN làm** — bảo vệ doanh thu deal lớn |
| 3 | Ngân sách Phase 0: 65-95 triệu | **OK** — chi phí thấp hơn nhiều so với Phase 1 international (600-900tr) |
| 4 | Outsource video editor cho 10-15 video tutorial | **NÊN** — chất lượng video quan trọng cho self-serve |
| 5 | Outsource native English reviewer cho UI | **NÊN** — 5-10tr/lần đáng đầu tư trước khi mở quốc tế |
| 6 | Có chấp nhận DEFER international 2-4 tuần nếu PLG Gate fail không? | **PHẢI chấp nhận** — đừng tiếc thời gian, vỡ Phase 0 = vỡ international |

---

## Phần 7 — Tóm Tắt Brutal Honest

### Nếu bạn làm Phase 0 này (3 sub-plan)
- ✅ Phần mềm SMIT thực sự PLG-ready (tự phục vụ tốt, không cần Sale rescue)
- ✅ Bottleneck Pre-PQL được fix → Pre-PQL rate 45-60%
- ✅ Sale 1+2 specialize → bảo vệ doanh thu deal lớn (>50 triệu)
- ✅ Có hệ thống đo lường để ra quyết định đúng
- ✅ Sẵn sàng launch international với rủi ro thấp

### Nếu bạn skip Phase 0 này, đi thẳng quốc tế
- ❌ User nước ngoài stuck → không có ai support → bỏ ngay
- ❌ Pre-PQL rate quốc tế sẽ <20% (tệ hơn VN nhiều)
- ❌ 600-900 triệu ngân sách international Phase 1 sẽ lãng phí
- ❌ Mất 4 tháng pilot mà không có data clear vì đo lường không đủ
- ❌ Sale 1+2 vỡ trận khi cố làm cả VN + 5 markets quốc tế

### Câu hỏi quan trọng nhất

> **"Có dám đầu tư 65-95 triệu + 4 tuần Phase 0 để bảo vệ 600-900 triệu Phase 1 international không?"**

- Nếu **YES** → Phase 0 bắt đầu Tuần 1.
- Nếu **NO** → Re-thinking lại scope, có thể defer international hoàn toàn cho Q sau.

---

## Phụ Lục — Các File Chi Tiết Đi Kèm

File này chỉ là **bản tóm tắt** Phase 0. Chi tiết execution xem các file riêng:

| File | Nội dung chi tiết |
|---|---|
| `SubPlan-00-Measurement-Foundation-2026-05-05.md` | 65 event PostHog, 4 dashboard, KPI formula đầy đủ cho 5 sub-plan |
| `SubPlan-01-Activation-Funnel-Fix-2026-05-05.md` | 5 cách đánh chi tiết, brief mẫu, A/B test framework |
| `SubPlan-05-Sale-to-Concierge-Transition-2026-05-05.md` | Phân vai Sale chi tiết, build Help Center + Bot |
| `SubPlan-Linkage-00-to-01-2026-05-05.md` | Mapping event Sub-Plan 0 → tactic Sub-Plan 1 (tiếng Việt) |
| `SubPlan-Linkage-00-to-03-05-06-2026-05-05.md` | Mapping cho Sub-Plan 3, 5, 6 (tiếng Việt) |
| `User-Journey-Map-2026-05-05.md` | Sơ đồ 6 stage user từ Quảng cáo → Purchase + KPI từng stage |
| `SMIT-International-Discovery-Tracker-v2-2026-05-05.xlsx` | Excel companion 9 sheet cho khi launch international |

**Sub-Plan 3 (Referral)** và **Sub-Plan 6 (Content Engine)** không thuộc Phase 0 (PLG Gate) — chúng thuộc Phase 1+ sau khi PLG Gate pass. File chi tiết vẫn có trong folder để tham khảo, nhưng không ưu tiên trong 4 tuần đầu.

---

*File này thay thế phiên bản masterplan cũ (đã move vào `_deprecated/`). Tập trung 3 sub-plan critical (00 + 01 + 05) là Phase 0 PLG Gate — điều kiện cần và đủ trước khi launch quốc tế.*
