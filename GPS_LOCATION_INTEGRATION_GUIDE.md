# 📍 GPS Location Integration - Complete Guide & Recommendations

## ✅ What Was Implemented

### 1. Auto-fill Form (FIXED)

- ✅ Fuzzy matching cho City/District/Ward
- ✅ Fallback khi không match được
- ✅ Lưu GPS coordinates vào form

### 2. GPS Coordinates in Orders (NEW)

- ✅ Thêm `location` field vào `shippingAddress` schema
- ✅ GeoJSON format: `{ type: "Point", coordinates: [lng, lat] }`
- ✅ 2dsphere index cho geospatial queries
- ✅ Transform shippingAddress trong CheckoutService

---

## 🗺️ Order Schema với GPS

### MasterOrder Model

```javascript
shippingAddress: {
  recipientName: String,
  phone: String,
  street: String,
  ward: String,
  district: String,
  city: String,
  notes: String,
  // ✅ GPS Coordinates (like Uber)
  location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: [Number], // [longitude, latitude]
    // 2dsphere index enabled for geospatial queries
  }
}
```

### Example Order Data

```json
{
  "orderNumber": "ORD-2025-001",
  "shippingAddress": {
    "recipientName": "Nguyễn Văn A",
    "phone": "0912345678",
    "street": "123 Nguyễn Huệ",
    "ward": "Phường Bến Nghé",
    "district": "Quận 1",
    "city": "Thành phố Hồ Chí Minh",
    "location": {
      "type": "Point",
      "coordinates": [106.7009, 10.7769]
    }
  }
}
```

---

## 🚀 Use Cases với GPS Coordinates

### 1. ✅ Printer Delivery Tracking (Implemented)

**Scenario:** Printer cần giao hàng cho khách

**Benefits:**

- 📍 Xem vị trí khách hàng trên bản đồ
- 🚗 Tính khoảng cách từ xưởng in đến khách
- 🗺️ Tìm đường tối ưu (Goong Directions API)
- ⏱️ Ước tính thời gian giao hàng

**Implementation:**

```javascript
// Printer Dashboard - Order Detail
const order = await MasterOrder.findById(orderId);
const customerLocation = order.shippingAddress.location.coordinates;
const printerLocation = printerProfile.shopAddress.location.coordinates;

// Calculate distance
const distance = calculateDistance(printerLocation, customerLocation);

// Show on map
<GoongMap>
  <Marker position={printerLocation} icon="printer" />
  <Marker position={customerLocation} icon="customer" />
  <Route from={printerLocation} to={customerLocation} />
</GoongMap>;
```

---

### 2. 🎯 Rush Order - Find Nearest Printers (Already Implemented)

**File:** `apps/customer-backend/src/modules/rush/rush.controller.js`

**Query:**

```javascript
const printers = await PrinterProfile.aggregate([
  {
    $geoNear: {
      near: {
        type: "Point",
        coordinates: [customerLng, customerLat],
      },
      distanceField: "distance",
      spherical: true,
      query: {
        "rushConfig.acceptsRushOrders": true,
      },
    },
  },
]);
```

---

### 3. 📊 Analytics & Insights (Recommended)

**Use Cases:**

- Phân tích khu vực có nhiều đơn hàng nhất
- Tối ưu vị trí kho/xưởng in
- Dự đoán nhu cầu theo địa lý

**Implementation:**

```javascript
// Find orders in a specific area (e.g., within 5km radius)
const ordersNearby = await MasterOrder.find({
  "shippingAddress.location": {
    $near: {
      $geometry: {
        type: "Point",
        coordinates: [106.7009, 10.7769],
      },
      $maxDistance: 5000, // 5km in meters
    },
  },
});

// Heatmap of orders
const orderHeatmap = await MasterOrder.aggregate([
  {
    $group: {
      _id: "$shippingAddress.district",
      count: { $sum: 1 },
      avgLocation: { $avg: "$shippingAddress.location.coordinates" },
    },
  },
]);
```

---

### 4. 🚚 Delivery Zone Management (Recommended)

**Use Case:** Printer chỉ giao hàng trong bán kính nhất định

**Implementation:**

```javascript
// Check if customer is within delivery zone
const isWithinDeliveryZone = await PrinterProfile.findOne({
  _id: printerId,
  "shopAddress.location": {
    $near: {
      $geometry: {
        type: "Point",
        coordinates: [customerLng, customerLat],
      },
      $maxDistance: printerProfile.maxDeliveryDistanceKm * 1000,
    },
  },
});

if (!isWithinDeliveryZone) {
  throw new Error("Ngoài vùng giao hàng");
}
```

---

### 5. 🎁 Location-Based Promotions (Recommended)

**Use Case:** Khuyến mãi theo khu vực

**Example:**

```javascript
// Promotion for District 1 customers
const promotion = {
  name: "Free shipping for District 1",
  conditions: {
    location: {
      $geoWithin: {
        $centerSphere: [
          [106.7009, 10.7769], // District 1 center
          5 / 6378.1, // 5km radius in radians
        ],
      },
    },
  },
  discount: { type: "shipping", value: 0 },
};
```

---

## 🛠️ Recommended Integrations

### Priority 1: Essential (Implement Now)

#### 1. **Printer Dashboard - Order Map View**

**File:** `apps/admin-frontend/src/features/orders/OrderDetailPage.tsx`

**Features:**

- Show customer location on Goong Map
- Calculate distance from printer to customer
- Show route on map
- Estimate delivery time

**Implementation:**

```typescript
import Map, { Marker, Source, Layer } from "react-map-gl";

const OrderMapView = ({ order, printerLocation }) => {
  const customerLocation = order.shippingAddress.location.coordinates;

  return (
    <Map
      initialViewState={{
        longitude: customerLocation[0],
        latitude: customerLocation[1],
        zoom: 13,
      }}
      mapStyle={GOONG_STYLE_URL}
    >
      {/* Printer Location */}
      <Marker longitude={printerLocation[0]} latitude={printerLocation[1]}>
        <PrinterIcon />
      </Marker>

      {/* Customer Location */}
      <Marker longitude={customerLocation[0]} latitude={customerLocation[1]}>
        <CustomerIcon />
      </Marker>

      {/* Route Line */}
      <Source type="geojson" data={routeGeoJSON}>
        <Layer
          type="line"
          paint={{ "line-color": "#3b82f6", "line-width": 3 }}
        />
      </Source>
    </Map>
  );
};
```

---

#### 2. **Delivery Distance Calculator**

**File:** `apps/customer-backend/src/shared/utils/geo.utils.js`

```javascript
/**
 * Calculate distance between two points using Haversine formula
 * @param {Array} point1 - [lng, lat]
 * @param {Array} point2 - [lng, lat]
 * @returns {Number} Distance in kilometers
 */
export const calculateDistance = (point1, point2) => {
  const [lng1, lat1] = point1;
  const [lng2, lat2] = point2;

  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (deg) => deg * (Math.PI / 180);
```

---

#### 3. **Shipping Fee Calculator (Distance-Based)**

**File:** `apps/customer-backend/src/modules/shipping/shipping.service.js`

```javascript
export class ShippingService {
  calculateShippingFee(printerLocation, customerLocation) {
    const distance = calculateDistance(printerLocation, customerLocation);

    // Pricing tiers
    if (distance <= 5) return 15000; // 15k for < 5km
    if (distance <= 10) return 25000; // 25k for 5-10km
    if (distance <= 20) return 40000; // 40k for 10-20km

    // 40k + 5k per additional 5km
    return 40000 + Math.ceil((distance - 20) / 5) * 5000;
  }
}
```

---

### Priority 2: Enhanced Features (Implement Later)

#### 4. **Real-time Delivery Tracking**

**Like Grab/Uber:**

- Shipper shares live location
- Customer sees shipper moving on map
- ETA updates in real-time

**Tech Stack:**

- Socket.io for real-time updates
- Goong Directions API for routing
- Mobile app for shipper

---

#### 5. **Delivery Zone Visualization**

**Printer Dashboard:**

- Show delivery coverage area on map
- Highlight areas with high demand
- Suggest optimal delivery zones

---

#### 6. **Smart Printer Recommendation**

**Customer Checkout:**

- Recommend nearest printer
- Show estimated delivery time
- Compare prices + delivery time

---

### Priority 3: Advanced Analytics (Future)

#### 7. **Order Heatmap**

**Admin Dashboard:**

- Visualize order density by area
- Identify high-demand zones
- Plan marketing campaigns

---

#### 8. **Delivery Performance Analytics**

**Metrics:**

- Average delivery time by distance
- On-time delivery rate by area
- Customer satisfaction by location

---

## 📋 Implementation Checklist

### ✅ Completed

- [x] GPS coordinates in Order schema
- [x] Auto-fill form with Goong.io
- [x] Save coordinates to database
- [x] Transform shippingAddress in CheckoutService

### 🚧 To Implement (Priority 1)

- [ ] Printer Dashboard - Order Map View
- [ ] Distance calculator utility
- [ ] Shipping fee calculator (distance-based)
- [ ] Route display on map

### 📅 Future (Priority 2)

- [ ] Real-time delivery tracking
- [ ] Delivery zone visualization
- [ ] Smart printer recommendation

### 🔮 Advanced (Priority 3)

- [ ] Order heatmap
- [ ] Delivery performance analytics
- [ ] Location-based promotions

---

## 🎯 Quick Wins (Implement These First)

### 1. Order Detail Map (2 hours)

```typescript
// apps/admin-frontend/src/features/orders/components/OrderLocationMap.tsx
export const OrderLocationMap = ({ order }) => {
  const location = order.shippingAddress.location.coordinates;
  return (
    <Map
      initialViewState={{
        longitude: location[0],
        latitude: location[1],
        zoom: 15,
      }}
    >
      <Marker longitude={location[0]} latitude={location[1]} />
    </Map>
  );
};
```

### 2. Distance Display (1 hour)

```typescript
// Show distance in order detail
const distance = calculateDistance(printerLocation, customerLocation);
<div>Khoảng cách: {distance.toFixed(1)} km</div>;
```

### 3. Shipping Fee Update (2 hours)

```javascript
// Update shipping fee based on distance
const shippingFee = shippingService.calculateShippingFee(
  printerLocation,
  customerLocation
);
```

---

## 🔧 Code Examples

### Frontend: Send Coordinates to Backend

```typescript
// apps/customer-frontend/src/features/customer/pages/CheckoutPage.tsx
const onSubmit = async (data) => {
  const payload = {
    shippingAddress: {
      recipientName: data.shippingAddress.fullName,
      phone: data.shippingAddress.phone,
      street: data.shippingAddress.street,
      ward: data.shippingAddress.ward,
      district: data.shippingAddress.district,
      city: data.shippingAddress.city,
      // ✅ Include GPS coordinates
      coordinates: data.shippingAddress.coordinates, // { lat, lng }
    },
    paymentMethod: data.paymentMethod,
  };

  await api.post("/checkout/create-order", payload);
};
```

### Backend: Query Orders by Location

```javascript
// Find orders within 10km of a point
const nearbyOrders = await MasterOrder.find({
  "shippingAddress.location": {
    $near: {
      $geometry: {
        type: "Point",
        coordinates: [106.7009, 10.7769],
      },
      $maxDistance: 10000, // 10km in meters
    },
  },
});
```

---

## 📚 Resources

### Goong.io APIs

- **Directions API**: https://docs.goong.io/rest/directions/
- **Distance Matrix API**: https://docs.goong.io/rest/distance_matrix/
- **Geocoding API**: https://docs.goong.io/rest/geocode/

### MongoDB Geospatial

- **2dsphere Index**: https://www.mongodb.com/docs/manual/core/2dsphere/
- **Geospatial Queries**: https://www.mongodb.com/docs/manual/geospatial-queries/

---

## ✅ Summary

### What's Working Now:

1. ✅ GPS detection with Goong.io
2. ✅ Auto-fill form (with fuzzy matching)
3. ✅ GPS coordinates saved in orders
4. ✅ GeoJSON format for MongoDB queries

### Next Steps:

1. 🎯 Implement Order Map View in Printer Dashboard
2. 🎯 Add distance calculator
3. 🎯 Update shipping fee based on distance

### Future Enhancements:

- Real-time delivery tracking
- Order heatmap analytics
- Location-based promotions

---

**Last Updated**: 2025-11-29
**Status**: ✅ Core Implementation Complete
**Next Priority**: Printer Dashboard Map View
