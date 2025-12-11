# Requirements Document - Threaded Chat System (Event-Based Conversations)

## Introduction

Hệ thống chat đa luồng (threaded chat) cho phép các bên liên quan trực tiếp hoặc gián tiếp tham gia thảo luận trong ngữ cảnh của một sự kiện cụ thể (đơn hàng, thiết kế, sản phẩm). Mô hình này tương tự như hệ thống bình luận trên Facebook, nơi mỗi sự kiện có thể có nhiều cuộc trò chuyện (threads) và mỗi thread có thể có replies lồng nhau.

## Glossary

- **Thread**: Một cuộc trò chuyện con trong ngữ cảnh của một sự kiện (đơn hàng, thiết kế, sản phẩm)
- **Parent Message**: Tin nhắn gốc bắt đầu một thread
- **Reply**: Tin nhắn trả lời trong một thread
- **Event Context**: Ngữ cảnh sự kiện (ORDER, DESIGN, PRODUCT) mà thread gắn liền
- **Stakeholder**: Các bên liên quan (khách hàng, nhà in, admin, designer)
- **Thread Participant**: Người tham gia vào một thread cụ thể
- **Notification Scope**: Phạm vi thông báo (chỉ thread, toàn bộ event, hoặc cả hai)

## Requirements

### Requirement 1: Event-Based Thread Management

**User Story:** Là người dùng, tôi muốn tạo và tham gia các cuộc trò chuyện riêng biệt trong ngữ cảnh của một sự kiện (đơn hàng/thiết kế), để có thể thảo luận các vấn đề cụ thể mà không làm lộn xộn cuộc trò chuyện chính.

#### Acceptance Criteria

1. WHEN người dùng xem một sự kiện (đơn hàng/thiết kế) THEN hệ thống SHALL hiển thị tất cả threads liên quan đến sự kiện đó
2. WHEN người dùng tạo thread mới THEN hệ thống SHALL yêu cầu chọn event context (ORDER, DESIGN, PRODUCT) và tự động thêm các stakeholders liên quan
3. WHEN thread được tạo THEN hệ thống SHALL lưu trữ referenceId, referenceType, và metadata của sự kiện
4. WHEN người dùng truy cập thread THEN hệ thống SHALL hiển thị context banner với thông tin sự kiện (mã đơn, tên sản phẩm, v.v.)
5. WHEN sự kiện có nhiều threads THEN hệ thống SHALL sắp xếp theo lastMessageAt và cho phép filter theo status (active, resolved, archived)

### Requirement 2: Nested Reply System

**User Story:** Là người dùng, tôi muốn trả lời trực tiếp một tin nhắn cụ thể trong thread, để làm rõ ngữ cảnh và dễ theo dõi cuộc trò chuyện.

#### Acceptance Criteria

1. WHEN người dùng click "Reply" trên một tin nhắn THEN hệ thống SHALL hiển thị reply input với preview của tin nhắn gốc
2. WHEN người dùng gửi reply THEN hệ thống SHALL lưu replyTo reference và hiển thị reply dưới tin nhắn gốc
3. WHEN tin nhắn có replies THEN hệ thống SHALL hiển thị số lượng replies và cho phép expand/collapse
4. WHEN người dùng expand replies THEN hệ thống SHALL load tất cả replies theo thứ tự thời gian
5. WHEN reply có độ sâu > 3 levels THEN hệ thống SHALL flatten structure để tránh quá sâu

### Requirement 3: Smart Participant Management

**User Story:** Là admin/moderator, tôi muốn quản lý ai có thể tham gia vào thread, để đảm bảo chỉ những người liên quan mới được thấy và tham gia cuộc trò chuyện.

#### Acceptance Criteria

1. WHEN thread được tạo từ event context THEN hệ thống SHALL tự động thêm stakeholders liên quan (khách hàng, nhà in, admin phụ trách)
2. WHEN người dùng mention (@username) trong thread THEN hệ thống SHALL tự động thêm người đó vào participants nếu họ có quyền truy cập event
3. WHEN moderator thêm participant THEN hệ thống SHALL kiểm tra quyền truy cập event trước khi cho phép
4. WHEN participant rời thread THEN hệ thống SHALL ẩn thread khỏi danh sách của họ nhưng vẫn giữ lịch sử tin nhắn
5. WHEN participant bị remove THEN hệ thống SHALL ngăn họ xem và gửi tin nhắn trong thread đó

### Requirement 4: Thread Status & Resolution

**User Story:** Là người dùng, tôi muốn đánh dấu thread là đã giải quyết hoặc cần chú ý, để dễ dàng quản lý và theo dõi các vấn đề.

#### Acceptance Criteria

1. WHEN thread được tạo THEN hệ thống SHALL set status mặc định là "active"
2. WHEN người dùng đánh dấu thread là resolved THEN hệ thống SHALL update status và hiển thị badge "Đã giải quyết"
3. WHEN thread có status "resolved" THEN hệ thống SHALL cho phép reopen nếu cần tiếp tục thảo luận
4. WHEN thread được pin THEN hệ thống SHALL hiển thị ở đầu danh sách threads của event
5. WHEN thread không có hoạt động > 7 ngày THEN hệ thống SHALL tự động archive và gửi notification cho participants

### Requirement 5: Real-time Notifications & Presence

**User Story:** Là người dùng, tôi muốn nhận thông báo real-time khi có tin nhắn mới trong threads tôi tham gia, để không bỏ lỡ thông tin quan trọng.

#### Acceptance Criteria

1. WHEN có tin nhắn mới trong thread THEN hệ thống SHALL gửi notification cho tất cả participants (trừ người gửi)
2. WHEN người dùng được mention THEN hệ thống SHALL gửi notification ưu tiên cao với highlight
3. WHEN người dùng đang typing trong thread THEN hệ thống SHALL hiển thị typing indicator cho participants khác
4. WHEN người dùng đọc tin nhắn THEN hệ thống SHALL update readBy array và hiển thị read receipts
5. WHEN thread có unread messages THEN hệ thống SHALL hiển thị badge với số lượng unread trên event card

### Requirement 6: Thread Search & Filter

**User Story:** Là người dùng, tôi muốn tìm kiếm threads theo nội dung, người tham gia, hoặc event, để nhanh chóng tìm lại thông tin cần thiết.

#### Acceptance Criteria

1. WHEN người dùng search THEN hệ thống SHALL tìm kiếm trong title, content, và metadata của threads
2. WHEN người dùng filter theo event type THEN hệ thống SHALL chỉ hiển thị threads thuộc ORDER, DESIGN, hoặc PRODUCT
3. WHEN người dùng filter theo participant THEN hệ thống SHALL hiển thị threads có người đó tham gia
4. WHEN người dùng filter theo status THEN hệ thống SHALL hiển thị threads active, resolved, hoặc archived
5. WHEN người dùng filter theo date range THEN hệ thống SHALL hiển thị threads được tạo trong khoảng thời gian đó

### Requirement 7: Rich Media & Attachments in Threads

**User Story:** Là người dùng, tôi muốn gửi hình ảnh, file, và links trong threads, để chia sẻ thông tin chi tiết và minh họa vấn đề.

#### Acceptance Criteria

1. WHEN người dùng upload file trong thread THEN hệ thống SHALL validate file type (image, pdf, doc) và size (< 10MB)
2. WHEN file được upload THEN hệ thống SHALL lưu vào S3 và tạo thumbnail cho images
3. WHEN người dùng paste link THEN hệ thống SHALL tự động generate preview (title, description, image)
4. WHEN tin nhắn có attachments THEN hệ thống SHALL hiển thị gallery view cho images và download button cho files
5. WHEN thread có nhiều attachments THEN hệ thống SHALL có tab "Files" để xem tất cả attachments trong thread

### Requirement 8: Thread Analytics & Insights

**User Story:** Là admin, tôi muốn xem analytics về threads (số lượng, thời gian phản hồi, resolution rate), để đánh giá hiệu quả giao tiếp và cải thiện quy trình.

#### Acceptance Criteria

1. WHEN admin truy cập analytics THEN hệ thống SHALL hiển thị tổng số threads theo event type và status
2. WHEN admin xem thread metrics THEN hệ thống SHALL hiển thị average response time và resolution time
3. WHEN admin xem participant metrics THEN hệ thống SHALL hiển thị số lượng threads mỗi user tham gia và message count
4. WHEN admin xem event metrics THEN hệ thống SHALL hiển thị số threads per event và correlation với order status
5. WHEN admin export report THEN hệ thống SHALL generate CSV với thread data và metrics

### Requirement 9: Thread Permissions & Privacy

**User Story:** Là admin, tôi muốn kiểm soát ai có thể tạo, xem, và tham gia threads, để đảm bảo bảo mật thông tin và tuân thủ quy trình.

#### Acceptance Criteria

1. WHEN người dùng tạo thread THEN hệ thống SHALL kiểm tra quyền create_thread dựa trên role và event ownership
2. WHEN người dùng xem thread THEN hệ thống SHALL kiểm tra họ có phải participant hoặc có quyền view_all_threads
3. WHEN thread có setting "private" THEN hệ thống SHALL chỉ cho phép participants và admins xem
4. WHEN thread có setting "read-only" THEN hệ thống SHALL chỉ cho phép moderators và admins gửi tin nhắn
5. WHEN người dùng không có quyền THEN hệ thống SHALL hiển thị error message rõ ràng và suggest contact admin

### Requirement 10: Mobile-Optimized Thread UI

**User Story:** Là người dùng mobile, tôi muốn trải nghiệm thread UI được tối ưu cho màn hình nhỏ, để dễ dàng theo dõi và tham gia cuộc trò chuyện.

#### Acceptance Criteria

1. WHEN người dùng xem threads trên mobile THEN hệ thống SHALL hiển thị compact list view với swipe actions
2. WHEN người dùng mở thread THEN hệ thống SHALL hiển thị full-screen view với back button
3. WHEN người dùng reply THEN hệ thống SHALL hiển thị bottom sheet với reply input và preview
4. WHEN người dùng scroll THEN hệ thống SHALL lazy load messages và replies để tối ưu performance
5. WHEN người dùng rotate device THEN hệ thống SHALL adapt layout và maintain scroll position

### Requirement 11: Thread Templates & Quick Actions

**User Story:** Là người dùng, tôi muốn sử dụng templates và quick actions để nhanh chóng tạo threads cho các tình huống phổ biến.

#### Acceptance Criteria

1. WHEN người dùng tạo thread THEN hệ thống SHALL hiển thị danh sách templates (Báo lỗi, Yêu cầu thay đổi, Hỏi đáp)
2. WHEN người dùng chọn template THEN hệ thống SHALL pre-fill title và content với template structure
3. WHEN thread thuộc ORDER context THEN hệ thống SHALL hiển thị quick actions (Yêu cầu hủy, Thay đổi địa chỉ, Báo lỗi sản phẩm)
4. WHEN người dùng click quick action THEN hệ thống SHALL tạo thread với template tương ứng và tag appropriate stakeholders
5. WHEN admin tạo custom template THEN hệ thống SHALL lưu và cho phép reuse cho organization

### Requirement 12: Integration với Existing Systems

**User Story:** Là developer, tôi muốn thread system tích hợp seamlessly với các hệ thống hiện có (orders, designs, notifications), để đảm bảo data consistency và user experience.

#### Acceptance Criteria

1. WHEN đơn hàng được tạo THEN hệ thống SHALL tự động tạo default thread "Thảo luận đơn hàng" với stakeholders
2. WHEN order status thay đổi THEN hệ thống SHALL post system message vào thread với status update
3. WHEN thread được resolved THEN hệ thống SHALL update order metadata với resolution notes
4. WHEN người dùng nhận notification THEN hệ thống SHALL deep link đến thread cụ thể trong app
5. WHEN thread có mentions THEN hệ thống SHALL sync với existing notification system (email, push, Zalo OA)
