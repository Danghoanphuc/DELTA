# Code Review Checklist

**Purpose**: Đảm bảo mọi thay đổi code đều được review kỹ lưỡng trước khi commit.

---

## Pre-Implementation Review

Trước khi bắt đầu code, AI PHẢI trả lời các câu hỏi sau:

### 1. Understanding the Request

- [ ] Tôi đã hiểu rõ yêu cầu của user chưa?
- [ ] Có cần làm rõ thêm thông tin không?
- [ ] Yêu cầu này ảnh hưởng đến những phần nào của hệ thống?

### 2. Architecture Impact

- [ ] Thay đổi này có phá vỡ layered architecture không?
- [ ] Có cần tạo layer mới không? (Model/Repository/Service/Controller)
- [ ] Có ảnh hưởng đến API contracts hiện tại không?
- [ ] Có cần migration database không?

### 3. Pattern Consistency

- [ ] Đã có pattern tương tự trong codebase chưa?
- [ ] Tôi có đang tạo pattern mới không cần thiết không?
- [ ] Naming convention có nhất quán không?

### 4. Dependencies

- [ ] Thay đổi này có ảnh hưởng đến modules khác không?
- [ ] Có cần update related code không?
- [ ] Có breaking changes không?

---

## During Implementation

### Backend Code Review

#### Model Layer

- [ ] Schema validation đầy đủ chưa?
- [ ] Có define enums cho status fields không?
- [ ] Instance methods có đúng chỗ không? (logic cho single document)
- [ ] Static methods có đúng chỗ không? (queries, utilities)
- [ ] Có indexes cho frequently queried fields không?

#### Repository Layer

- [ ] Tất cả database operations đều qua repository chưa?
- [ ] Có dùng `.lean()` cho read operations không?
- [ ] Pagination logic đúng chưa?
- [ ] Error handling đầy đủ chưa?
- [ ] Có populate relationships cần thiết không?

#### Service Layer

- [ ] Business logic có ở đúng layer không?
- [ ] Validation đầy đủ chưa?
- [ ] Authorization checks đúng chưa?
- [ ] Có dùng custom exceptions không? (ValidationException, NotFoundException, etc.)
- [ ] Có logging cho important operations không?
- [ ] Error messages có clear và user-friendly không?
- [ ] Có handle edge cases không?

#### Controller Layer

- [ ] Controller có thin không? (chỉ handle HTTP)
- [ ] Có extract data từ req đúng cách không? (body, params, query, user)
- [ ] Có dùng try-catch với next(error) không?
- [ ] HTTP status codes đúng chưa?
- [ ] Response format nhất quán chưa? (ApiResponse.success)
- [ ] Có JSDoc comments cho routes không?

#### Routes Layer

- [ ] RESTful conventions đúng chưa?
- [ ] Middleware order đúng chưa? (auth, validation, etc.)
- [ ] Route naming clear và consistent chưa?

### Frontend Code Review

#### Service Layer

- [ ] Tất cả API calls đều qua service layer chưa?
- [ ] Response data có được unwrap đúng cách không?
- [ ] TypeScript interfaces đầy đủ chưa?
- [ ] Error handling để hook layer xử lý chưa?

#### Hooks Layer

- [ ] Hook có focused không? (Single Responsibility)
- [ ] Loading states được handle chưa?
- [ ] Error states được handle chưa?
- [ ] Có dùng toast cho user feedback không?
- [ ] Dependencies array đúng chưa?
- [ ] Return values có clear naming không?

#### Component Layer

- [ ] Component có quá lớn không? (cần split?)
- [ ] Props có TypeScript types không?
- [ ] Loading và error states được hiển thị chưa?
- [ ] Có extract reusable logic ra hooks không?
- [ ] Có dùng shared components khi có thể không?

---

## Post-Implementation Review

### Code Quality

- [ ] Code có readable và maintainable không?
- [ ] Có comments cho complex logic không?
- [ ] Naming có clear và consistent không?
- [ ] Có duplicate code cần refactor không?
- [ ] Có magic numbers/strings cần extract thành constants không?

### Testing Considerations

- [ ] Code này có testable không?
- [ ] Có edge cases cần test không?
- [ ] Error paths có được cover không?

### Performance

- [ ] Có N+1 query problems không?
- [ ] Có unnecessary database calls không?
- [ ] Có memory leaks potential không?
- [ ] Có optimize được queries không?

### Security

- [ ] Input validation đầy đủ chưa?
- [ ] Authorization checks đúng chưa?
- [ ] Sensitive data có được protect không?
- [ ] SQL injection risks có được prevent không?

### Documentation

- [ ] Public APIs có JSDoc không?
- [ ] Complex logic có comments không?
- [ ] Breaking changes có được document không?
- [ ] README cần update không?

---

## Before Committing

### Final Checks

- [ ] Code có chạy được không?
- [ ] Có syntax errors không?
- [ ] Có linting errors không?
- [ ] Có TypeScript errors không?
- [ ] Có test failures không?

### Impact Assessment

- [ ] Thay đổi này có break existing functionality không?
- [ ] Có cần update documentation không?
- [ ] Có cần notify team không?
- [ ] Có cần migration script không?

### Rollback Plan

- [ ] Nếu có vấn đề, có thể rollback dễ dàng không?
- [ ] Có data migration cần rollback không?
- [ ] Có breaking API changes cần versioning không?

---

## Red Flags - STOP Immediately If:

🚨 **Architecture Violations**

- Truy cập model trực tiếp từ controller
- Business logic trong controller
- Database operations không qua repository
- Mixing concerns giữa các layers

🚨 **Pattern Inconsistencies**

- Tạo pattern mới khi đã có pattern tương tự
- Naming không theo convention
- File structure không theo standard

🚨 **Quality Issues**

- Không có error handling
- Không có validation
- Không có logging cho important operations
- Magic numbers/strings everywhere

🚨 **Security Risks**

- Không có authorization checks
- Không validate user input
- Expose sensitive data
- SQL injection risks

---

## AI Self-Review Questions

Trước khi present code cho user, AI tự hỏi:

1. **"Nếu tôi là developer khác, tôi có hiểu code này không?"**

   - Nếu không → Add comments

2. **"Code này có follow existing patterns không?"**

   - Nếu không → Refactor to match patterns

3. **"Có cách nào đơn giản hơn không?"**

   - Nếu có → Simplify

4. **"Thay đổi này có break gì không?"**

   - Nếu có → Fix or notify user

5. **"Tôi có tự hào với code này không?"**
   - Nếu không → Improve it

---

## Summary

**Remember**:

- ✅ **Quality > Speed**: Làm đúng quan trọng hơn làm nhanh
- ✅ **Consistency > Cleverness**: Nhất quán quan trọng hơn thông minh
- ✅ **Maintainability > Features**: Dễ maintain quan trọng hơn nhiều features
- ✅ **System Thinking > Quick Fixes**: Suy nghĩ toàn hệ thống quan trọng hơn fix nhanh

**When in doubt, ask the user for clarification rather than making assumptions.**
