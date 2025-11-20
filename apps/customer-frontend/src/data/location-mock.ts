// apps/customer-frontend/src/data/location-mock.ts
// Mock data cho địa chỉ Việt Nam (City -> District -> Ward)

export interface Ward {
  code: string;
  name: string;
}

export interface District {
  code: string;
  name: string;
  wards: Ward[];
}

export interface City {
  code: string;
  name: string;
  districts: District[];
}

export const VIETNAM_LOCATIONS: City[] = [
  {
    code: "HCM",
    name: "Thành phố Hồ Chí Minh",
    districts: [
      {
        code: "Q1",
        name: "Quận 1",
        wards: [
          { code: "BENNGHE", name: "Phường Bến Nghé" },
          { code: "BENTHANH", name: "Phường Bến Thành" },
          { code: "NGUYENTHAIBINHH", name: "Phường Nguyễn Thái Bình" },
          { code: "PHAMNGULAOO", name: "Phường Phạm Ngũ Lão" },
          { code: "CAUMONGBRIDGEE", name: "Phường Cầu Ông Lãnh" },
        ],
      },
      {
        code: "Q3",
        name: "Quận 3",
        wards: [
          { code: "P1", name: "Phường 1" },
          { code: "P2", name: "Phường 2" },
          { code: "P3", name: "Phường 3" },
          { code: "P4", name: "Phường 4" },
          { code: "P5", name: "Phường 5" },
        ],
      },
      {
        code: "BINHTAN",
        name: "Quận Bình Tân",
        wards: [
          { code: "BINHTRIDAN", name: "Phường Bình Trị Đông" },
          { code: "BINHHUNGHOA", name: "Phường Bình Hưng Hòa" },
          { code: "ANHPHU", name: "Phường An Lạc" },
        ],
      },
      {
        code: "TANBINH",
        name: "Quận Tân Bình",
        wards: [
          { code: "P1TB", name: "Phường 1" },
          { code: "P2TB", name: "Phường 2" },
          { code: "P3TB", name: "Phường 3" },
          { code: "P4TB", name: "Phường 4" },
          { code: "P12TB", name: "Phường 12" },
        ],
      },
      {
        code: "THUDUC",
        name: "Thành phố Thủ Đức",
        wards: [
          { code: "LINH_CHIEU", name: "Phường Linh Chiểu" },
          { code: "LINH_TRUNG", name: "Phường Linh Trung" },
          { code: "BINH_THO", name: "Phường Bình Thọ" },
          { code: "TAM_BINH", name: "Phường Tam Bình" },
        ],
      },
    ],
  },
  {
    code: "HN",
    name: "Thành phố Hà Nội",
    districts: [
      {
        code: "HOANKIEM",
        name: "Quận Hoàn Kiếm",
        wards: [
          { code: "HANGGAI", name: "Phường Hàng Gai" },
          { code: "HANGBAC", name: "Phường Hàng Bạc" },
          { code: "HANGBUOM", name: "Phường Hàng Buồm" },
          { code: "TRANGIEN", name: "Phường Tràng Tiền" },
        ],
      },
      {
        code: "DONGDA",
        name: "Quận Đống Đa",
        wards: [
          { code: "VANLANG", name: "Phường Văn Miếu" },
          { code: "QUOCTU", name: "Phường Quốc Tử Giám" },
          { code: "LANGHA", name: "Phường Láng Hạ" },
        ],
      },
      {
        code: "CAUGIAY",
        name: "Quận Cầu Giấy",
        wards: [
          { code: "DICHVONG", name: "Phường Dịch Vọng" },
          { code: "MAIDINH", name: "Phường Mai Dịch" },
          { code: "NGHIADO", name: "Phường Nghĩa Đô" },
        ],
      },
    ],
  },
  {
    code: "DN",
    name: "Thành phố Đà Nẵng",
    districts: [
      {
        code: "HAICHAU",
        name: "Quận Hải Châu",
        wards: [
          { code: "THACHTHANG", name: "Phường Thạch Thang" },
          { code: "HAICHAU1", name: "Phường Hải Châu 1" },
          { code: "HAICHAU2", name: "Phường Hải Châu 2" },
        ],
      },
      {
        code: "SONTRA",
        name: "Quận Sơn Trà",
        wards: [
          { code: "THOQUAN", name: "Phường Thọ Quang" },
          { code: "NAITRANG", name: "Phường Nại Hiên Đông" },
        ],
      },
    ],
  },
];

// ============================================
// GEOLOCATION SIMULATION
// ============================================

export interface DetectedLocation {
  city: string;
  district: string;
  ward: string;
  cityCode: string;
  districtCode: string;
  wardCode: string;
}

/**
 * Mô phỏng việc detect location từ tọa độ GPS
 * Trong thực tế, bạn sẽ gọi API reverse geocoding (Google Maps, OpenStreetMap, etc.)
 */
export const detectLocationFromCoords = async (
  lat: number,
  lng: number
): Promise<DetectedLocation> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Mock logic: Dựa vào tọa độ để trả về địa chỉ mẫu
  // Tọa độ HCM: ~10.7, 106.7
  // Tọa độ HN: ~21.0, 105.8
  // Tọa độ DN: ~16.0, 108.2

  if (lat >= 10.5 && lat <= 11.0 && lng >= 106.5 && lng <= 107.0) {
    // Hồ Chí Minh
    return {
      city: "Thành phố Hồ Chí Minh",
      district: "Quận 1",
      ward: "Phường Bến Nghé",
      cityCode: "HCM",
      districtCode: "Q1",
      wardCode: "BENNGHE",
    };
  } else if (lat >= 20.5 && lat <= 21.5 && lng >= 105.5 && lng <= 106.0) {
    // Hà Nội
    return {
      city: "Thành phố Hà Nội",
      district: "Quận Hoàn Kiếm",
      ward: "Phường Hàng Gai",
      cityCode: "HN",
      districtCode: "HOANKIEM",
      wardCode: "HANGGAI",
    };
  } else if (lat >= 15.5 && lat <= 16.5 && lng >= 107.5 && lng <= 108.5) {
    // Đà Nẵng
    return {
      city: "Thành phố Đà Nẵng",
      district: "Quận Hải Châu",
      ward: "Phường Thạch Thang",
      cityCode: "DN",
      districtCode: "HAICHAU",
      wardCode: "THACHTHANG",
    };
  } else {
    // Default: HCM Quận 1
    return {
      city: "Thành phố Hồ Chí Minh",
      district: "Quận 1",
      ward: "Phường Bến Nghé",
      cityCode: "HCM",
      districtCode: "Q1",
      wardCode: "BENNGHE",
    };
  }
};

/**
 * Helper: Lấy danh sách quận/huyện theo mã thành phố
 */
export const getDistrictsByCity = (cityCode: string): District[] => {
  const city = VIETNAM_LOCATIONS.find((c) => c.code === cityCode);
  return city?.districts || [];
};

/**
 * Helper: Lấy danh sách phường/xã theo mã quận
 */
export const getWardsByDistrict = (
  cityCode: string,
  districtCode: string
): Ward[] => {
  const city = VIETNAM_LOCATIONS.find((c) => c.code === cityCode);
  const district = city?.districts.find((d) => d.code === districtCode);
  return district?.wards || [];
};

