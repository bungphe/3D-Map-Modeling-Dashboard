import { PresetMap } from "./types";

export const PRESET_MAPS: PresetMap[] = [
  {
    id: "guangxi-mountain",
    name: "Địa hình Quảng Tây (RayData inspired)",
    description: "Mô phỏng 3D núi non trùng điệp từ không ảnh vệ tinh khu cực Quảng Tây, Trung Quốc, với các trạm đo thủy văn và khí tượng sông.",
    mapType: "Image Map",
    thumbnail: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=150&auto=format&fit=crop&q=60",
    previewUrl: "/api/presets/guangxi",
    data: {
      regionName: "Vùng Địa Hình Quảng Tây (GIS)",
      metrics: {
        totalArea: "237,600 km²",
        averageHeight: "410 m",
        activeSensors: 42,
        weatherStatus: "Thời tiết: 24°C, Đang quan trắc mưa bão mùa hè",
      },
      heightGrid: [
        [15, 25, 45, 60, 50, 40, 30, 48, 25, 10],
        [20, 48, 65, 80, 55, 35, 45, 75, 40, 15],
        [15, 30, 50, 75, 85, 40, 60, 90, 55, 25],
        [10, 20, 30, 45, 70, 80, 50, 65, 45, 20],
        [5, 12, 18, 25, 40, 50, 35, 40, 30, 15],
        [8, 15, 22, 35, 55, 60, 42, 35, 25, 12],
        [15, 28, 48, 65, 75, 70, 55, 45, 30, 18],
        [22, 45, 70, 85, 95, 80, 60, 50, 35, 15],
        [18, 35, 55, 70, 80, 65, 45, 32, 20, 10],
        [10, 20, 35, 45, 50, 40, 25, 15, 10, 5]
      ],
      pointsOfInterest: [
        { name: "Trạm Thủy Văn Quế Lâm", type: "weather", x: 40, y: 25, value: "Nước dâng +0.4m", status: "active" },
        { name: "Trạm Đo Sương Mù Nam Ninh", type: "weather", x: 65, y: 70, value: "Tầm nhìn 1.2km", status: "warning" },
        { name: "Trung Tâm Dự Báo Lũ Lụt", type: "industrial", x: 48, y: 48, value: "Hoạt động 100%", status: "active" },
        { name: "Trạm Cảnh Báo Sạt Lở A3", type: "sensor", x: 22, y: 35, value: "Nguy cơ THẤP", status: "active" },
        { name: "Trạm Cảm Biến Lưu Lượng Sông Tây Giang", type: "sensor", x: 80, y: 50, value: "1,540 m³/s", status: "active" },
        { name: "Nút Giao Cao Tốc Baise-Nanning", type: "traffic", x: 30, y: 60, value: "Mật độ: Đông", status: "warning" }
      ],
      chartData: [
        { name: "Tháng 1", sanLuong: 120, nangLuong: 80, chitieu: 100 },
        { name: "Tháng 2", sanLuong: 150, nangLuong: 95, chitieu: 110 },
        { name: "Tháng 3", sanLuong: 180, nangLuong: 110, chitieu: 130 },
        { name: "Tháng 4", sanLuong: 240, nangLuong: 130, chitieu: 150 },
        { name: "Tháng 5", sanLuong: 310, nangLuong: 160, chitieu: 200 },
        { name: "Tháng 6", sanLuong: 450, nangLuong: 220, chitieu: 300 },
        { name: "Tháng 7", sanLuong: 520, nangLuong: 250, chitieu: 350 }
      ],
      warnings: [
        "Lượng mưa tích dồn 24 giờ qua tại Quế Lâm vượt ngưỡng báo động cấp 1",
        "Mây mù dày đặc che khuất tầm nhìn máy bay tại vùng phía Tây Nam Ninh",
        "Dòng chảy thượng nguồn Tây Giang dâng nhanh do thủy điện điều tiết xả lũ"
      ]
    }
  },
  {
    id: "phu-quoc-ecosystem",
    name: "Bản đồ Đảo Phú Quốc (Việt Nam)",
    description: "Được xây dựng từ không ảnh bờ biển đảo Phú Quốc, hỗ trợ trực quan hóa sinh thái biển, độ ẩm rừng quốc gia và các trạm khí tượng du lịch.",
    mapType: "Image Map",
    thumbnail: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=150&auto=format&fit=crop&q=60",
    previewUrl: "/api/presets/phuquoc",
    data: {
      regionName: "Đảo Ngọc Phú Quốc (Sinh Thái)",
      metrics: {
        totalArea: "589.2 km²",
        averageHeight: "135 m",
        activeSensors: 18,
        weatherStatus: "Thời tiết: 29°C, Gió Tây Nam 18km/h, Thủy triều ổn định",
      },
      heightGrid: [
        [0, 0, 0, 0, 5, 8, 3, 0, 0, 0],
        [0, 0, 0, 5, 15, 20, 10, 0, 0, 0],
        [0, 0, 5, 25, 45, 50, 25, 5, 0, 0],
        [0, 0, 15, 38, 55, 60, 35, 12, 0, 0],
        [0, 5, 22, 45, 50, 48, 30, 18, 5, 0],
        [0, 10, 30, 55, 65, 75, 42, 22, 8, 0],
        [0, 8, 25, 40, 55, 50, 35, 15, 4, 0],
        [0, 0, 12, 28, 38, 42, 20, 8, 0, 0],
        [0, 0, 5, 15, 20, 25, 10, 2, 0, 0],
        [0, 0, 0, 0, 2, 5, 2, 0, 0, 0]
      ],
      pointsOfInterest: [
        { name: "Cảng Hàng Không Quốc Tế Phú Quốc", type: "traffic", x: 45, y: 65, value: "Tần suất: 32 chuyến/h", status: "active" },
        { name: "Trạm Thủy Phong Dương Đông", type: "weather", x: 38, y: 40, value: "Nhiệt độ nước: 28.1°C", status: "active" },
        { name: "Trạm Kiểm Lâm Rừng Quốc Gia PQ", type: "ecological", x: 55, y: 28, value: "Độ ẩm đất: 84%", status: "active" },
        { name: "Bảo Tồn San Hô Hòn Thơm", type: "ecological", x: 50, y: 88, value: "Chỉ số UV: 8.5", status: "warning" },
        { name: "Trạm Sóng Biển Bãi Trường", type: "sensor", x: 25, y: 55, value: "Sóng cao: 1.2m", status: "active" }
      ],
      chartData: [
        { name: "Tháng 1", sanLuong: 280, nangLuong: 110, chitieu: 300 },
        { name: "Tháng 2", sanLuong: 310, nangLuong: 115, chitieu: 300 },
        { name: "Tháng 3", sanLuong: 350, nangLuong: 120, chitieu: 350 },
        { name: "Tháng 4", sanLuong: 400, nangLuong: 135, chitieu: 400 },
        { name: "Tháng 5", sanLuong: 220, nangLuong: 150, chitieu: 250 },
        { name: "Tháng 6", sanLuong: 180, nangLuong: 170, chitieu: 200 },
        { name: "Tháng 7", sanLuong: 195, nangLuong: 165, chitieu: 220 }
      ],
      warnings: [
        "Chỉ số bức xạ tia cực tím (UV Index) tại các bãi tắm phía Nam chạm mức Nguy hiểm lúc giữa trưa",
        "Hệ thống phát hiện sớm cháy rừng đưa ra cảnh báo cấp độ Trung bình tại khu vực Bắc Đảo",
        "Dự kiến triều dâng kết hợp sóng cao tại bờ biển Tây trong 3 tiếng tới"
      ]
    }
  },
  {
    id: "urban-smart-city",
    name: "Mặt bằng DWG Đô thị Tây Hồ Tây",
    description: "Nhập tài liệu bản vẽ CAD/DWG, tự động nhận diện chân đế công trình và độ cao quy hoạch để dựng các khối nhà 3D, mạng lưới trạm thu phát 5G.",
    mapType: "DWG Draft",
    thumbnail: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=150&auto=format&fit=crop&q=60",
    previewUrl: "/api/presets/tayho",
    data: {
      regionName: "KĐT Ngoại Giao Đoàn - Tây Hồ",
      metrics: {
        totalArea: "186.3 ha",
        averageHeight: "28 tầng",
        activeSensors: 35,
        weatherStatus: "Thời tiết: 31°C, Chất lượng không khí AQI: 72 (Khá)",
      },
      heightGrid: [
        [4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
        [4, 80, 4, 50, 4, 45, 4, 60, 4, 4],
        [4, 80, 4, 50, 4, 45, 4, 60, 4, 4],
        [4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
        [4, 4, 95, 4, 4, 110, 4, 4, 4, 4],
        [4, 4, 95, 4, 4, 110, 4, 55, 55, 4],
        [4, 4, 4, 4, 4, 4, 4, 55, 55, 4],
        [4, 75, 4, 4, 4, 4, 4, 4, 4, 4],
        [4, 75, 4, 35, 35, 4, 45, 45, 45, 4],
        [4, 4, 4, 4, 4, 4, 4, 4, 4, 4]
      ],
      pointsOfInterest: [
        { name: "Tháp Tổ hợp Landmark CT1", type: "industrial", x: 25, y: 50, value: "Hoạt động: 87%", status: "active" },
        { name: "Tòa tháp Tài chính Vietin", type: "industrial", x: 55, y: 53, value: "Hoạt động: 94%", status: "active" },
        { name: "Trạm sạc nhanh EV Trung Tâm", type: "sensor", x: 45, y: 35, value: "6/8 cổng sẵn sàng", status: "active" },
        { name: "Trạm Quan trắc Không khí Tây Hồ", type: "weather", x: 75, y: 28, value: "AQI: 72, PM2.5: 22µg", status: "active" },
        { name: "Vòng xuyến giao thông Võ Chí Công", type: "traffic", x: 80, y: 75, value: "Ùn ứ nhẹ giờ cao điểm", status: "warning" },
        { name: "Hệ thống Bơm thoát nước Hồ Tây", type: "sensor", x: 18, y: 22, value: "Mực nước hồ: Bình thường", status: "active" }
      ],
      chartData: [
        { name: "Tháng 1", sanLuong: 850, nangLuong: 400, chitieu: 800 },
        { name: "Tháng 2", sanLuong: 810, nangLuong: 390, chitieu: 800 },
        { name: "Tháng 3", sanLuong: 880, nangLuong: 410, chitieu: 850 },
        { name: "Tháng 4", sanLuong: 920, nangLuong: 435, chitieu: 900 },
        { name: "Tháng 5", sanLuong: 1040, nangLuong: 580, chitieu: 1000 },
        { name: "Tháng 6", sanLuong: 1180, nangLuong: 640, chitieu: 1100 },
        { name: "Tháng 7", sanLuong: 1220, nangLuong: 660, chitieu: 1150 }
      ],
      warnings: [
        "Mật độ giao thông đường Võ Chí Công tăng cao chiều đi cầu Nhật Tân",
        "Hệ thống điện tòa CT1 ghi nhận đỉnh tải lúc 14:15, điện áp lưới ổn định",
        "Phát hiện nhiệt độ bê tông bề mặt đạt 45°C do bức xạ mặt trời trực tiếp"
      ]
    }
  }
];
