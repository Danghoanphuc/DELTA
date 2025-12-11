# Design Document - Supply Chain & Vendor Management System

## Overview

Hệ thống quản lý chuỗi cung ứng và nhà cung cấp cho mô hình "Anchor Node" và "Không kho" của Delta Swag Platform. Hệ thống này biến đổi form thêm sản phẩm và nhà cung cấp từ "Address Book" đơn giản thành "Hồ sơ năng lực chuỗi cung ứng" toàn diện, cho phép:

- Tự động định tuyến đơn hàng dựa trên năng lực và vị trí vendor
- Tính toán chi phí logistics chính xác với geo-spatial routing
- Quản lý dòng tiền tự động (Auto-Banking)
- Theo dõi hiệu suất vendor real-time
- Tự động chuyển đổi vendor khi cần thiết

### Key Design Decisions

**1. Geo-Spatial First Approach**

- Lưu trữ tọa độ GPS cho mọi vendor và địa chỉ giao hàng
- Sử dụng MongoDB geospatial queries cho distance calculation
- Rationale: Tính toán khoảng cách chính xác là nền tảng cho routing và cost optimization

**2. Vendor Capability Matrix**

- Mỗi vendor có structured capability profile (không chỉ là contact info)
- Capability-based routing thay vì manual assignment
- Rationale: Cho phép hệ thống tự động quyết định vendor phù hợp nhất

**3. Product-Vendor Many-to-Many với Priority**

- Mỗi product có thể có nhiều vendors (Primary, Backup 1, Backup 2)
- Mỗi vendor-product relationship có riêng COGS, lead time, SKU
- Rationale: Flexibility và resilience khi primary vendor không available

**4. Active Communication Integration**

- Tích hợp Zalo OA API cho real-time notifications
- Escalation workflow tự động
- Rationale: Giảm response time và tăng automation level

**5. Intelligent Routing Engine**

- Rule-based engine với cost optimization
- Support cả Direct Ship và Anchor Node patterns
- Rationale: Tối ưu hóa chi phí và thời gian giao hàng

## Architecture

### System Context

```
┌─────────────────────────────────────────────────────────────┐
│                    Admin Backend                             │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Vendor     │  │   Product    │  │   Order      │     │
│  │  Management  │  │  Management  │  │  Management  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         │                  │                  │             │
│         └──────────────────┴──────────────────┘             │
│                           │                                 │
│                  ┌────────▼────────┐                       │
│                  │  Routing Engine │                       │
│                  └────────┬────────┘                       │
│                           │                                 │
│         ┌─────────────────┼─────────────────┐             │
│         │                 │                 │             │
│  ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐     │
│  │   Vendor    │  │  Financial  │  │ Performance │     │
│  │ Comm Service│  │   Service   │  │   Tracking  │     │
│  └──────┬──────┘  └──────┬──────┘  └─────────────┘     │
│         │                 │                               │
└─────────┼─────────────────┼───────────────────────────────┘
          │                 │
          │                 │
┌─────────▼─────────┐ ┌────▼──────────┐
│   Zalo OA API     │ │  Banking API  │
│  (Notifications)  │ │ (VietQR, etc) │
└───────────────────┘ └───────────────┘
```

### Layered Architecture

Following Delta Swag Platform standards:

```
┌─────────────────────────────────────────────────────────┐
│                    Controller Layer                      │
│  vendor.controller.ts, product.controller.ts, etc.      │
│  - HTTP request/response handling                       │
│  - Input extraction and validation delegation           │
└─────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────────┐
│                     Service Layer                        │
│  vendor.service.ts, routing.service.ts, etc.           │
│  - Business logic and orchestration                     │
│  - Vendor capability evaluation                         │
│  - Routing decisions                                    │
│  - Auto-switch logic                                    │
└─────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────────┐
│                   Repository Layer                       │
│  vendor.repository.ts, product.repository.ts, etc.     │
│  - Data access abstraction                              │
│  - Geospatial queries                                   │
│  - Complex aggregations                                 │
└─────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────────┐
│                      Model Layer                         │
│  vendor.model.ts, product.model.ts, etc.               │
│  - Mongoose schemas and validation                      │
│  - Geospatial indexes                                   │
└─────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Vendor Management Module

#### Vendor Model
