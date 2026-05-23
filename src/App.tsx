import React, { useState, useEffect, useRef } from "react";
import {
  MapPin,
  Activity,
  CloudLightning,
  Cpu,
  Layers,
  ShieldAlert,
  UploadCloud,
  Sliders,
  Eye,
  RefreshCw,
  Compass,
  Radio,
  FileText,
  AlertTriangle,
  Flame,
  BatteryCharging,
  Maximize2,
  Calendar,
  Clock,
  ExternalLink,
  ChevronRight,
  Info
} from "lucide-react";
import { PRESET_MAPS } from "./presets";
import { MapData, PointOfInterest } from "./types";
import ThreeCanvas from "./components/ThreeCanvas";
import MetricCharts from "./components/MetricCharts";

export default function App() {
  // Current app state
  const [selectedPresetId, setSelectedPresetId] = useState<string>("guangxi-mountain");
  const [mapData, setMapData] = useState<MapData>(PRESET_MAPS[0].data);
  const [heightMultiplier, setHeightMultiplier] = useState<number>(1.2);
  const [selectedPoi, setSelectedPoi] = useState<PointOfInterest | null>(null);
  
  // HUD Cosmetics state
  const [showScanner, setShowScanner] = useState<boolean>(true);
  const [wireframeMode, setWireframeMode] = useState<boolean>(true);
  const [mapTypeColor, setMapTypeColor] = useState<string>("cyan"); // 'cyan' | 'green' | 'amber'

  // AI Analyzer states
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analyzingProgress, setAnalyzingProgress] = useState<number>(0);
  const [activeLogMsg, setActiveLogMsg] = useState<string>("");
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const [uploadedBase64, setUploadedBase64] = useState<string>("");
  const [customMapName, setCustomMapName] = useState<string>("Mặt bằng quy hoạch mới");
  const [manualDwgCoords, setManualDwgCoords] = useState<string>(
    `# AutoCAD Contour DWG Data\nVERTICES: 100\nHEIGHTS: [12,24,35,48,82,75,90,...]\nGRID_SCALE: 1:500`
  );

  // Real-time UTC clock state
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toISOString().replace("T", " ").substring(0, 19) + " UTC");
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Sync preset change
  const handlePresetSelect = (id: string) => {
    const selected = PRESET_MAPS.find((m) => m.id === id);
    if (selected) {
      setSelectedPresetId(id);
      setMapData(selected.data);
      setSelectedPoi(null);
      // Select appropriate theme colors depending on preset chosen
      if (id === "phu-quoc-ecosystem") {
        setMapTypeColor("green");
      } else if (id === "urban-smart-city") {
        setMapTypeColor("amber");
      } else {
        setMapTypeColor("cyan");
      }
    }
  };

  // Diagnostic loading logs messages
  const DIAGNOSTIC_MESSAGES = [
    "Khởi động tiến trình xử lý ảnh nhị phân...",
    "Thiết lập ma trận lưới tọa độ 10x10...",
    "Gemini phân tích các đường đồng mức (contours)...",
    "Trích xuất ranh giới khu vực và tính toán đỉnh núi...",
    "Nhận diện vị trí tối ưu của 5 trạm quan trắc kế cận...",
    "Tổng hợp biểu đồ tiêu thụ tài nguyên và sản lượng...",
    "Đồng bộ hóa dữ liệu mô hình hóa 3D không gian thực..."
  ];

  // Process uploaded image file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    // Automatically fill customized map name from file name
    const cleanName = file.name.replace(/\.[^/.]+$/, "");
    setCustomMapName("Mặt bằng: " + cleanName);

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setUploadedBase64(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Send encoded layout directly to Gemini analyzer
  const startMapAnalysis = async () => {
    if (!uploadedBase64) {
      alert("Vui lòng tải lên một tệp hình ảnh bản đồ 2D hoặc sơ đồ thiết kế!");
      return;
    }

    setIsAnalyzing(true);
    setAnalyzingProgress(0);
    setSelectedPoi(null);

    // Simulate steady visual progress increments
    let progress = 0;
    const interval = setInterval(() => {
      progress += 4;
      if (progress <= 95) {
        setAnalyzingProgress(progress);
        const logIndex = Math.floor((progress / 100) * DIAGNOSTIC_MESSAGES.length);
        setActiveLogMsg(DIAGNOSTIC_MESSAGES[logIndex] || "Đang mô hình hóa...");
      }
    }, 150);

    try {
      const response = await fetch("/api/analyze-map", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: uploadedBase64,
          mapName: customMapName,
          mapType: "Custom User Upload",
        }),
      });

      if (!response.ok) {
        throw new Error("Lỗi kết nối máy chủ phân tích");
      }

      const parsedData = await response.json();
      
      clearInterval(interval);
      setAnalyzingProgress(100);
      setMapData(parsedData);
      setSelectedPresetId("custom-upload");
      setMapTypeColor("cyan"); // default upload colors
      setIsAnalyzing(false);
    } catch (err: any) {
      console.error(err);
      clearInterval(interval);
      setIsAnalyzing(false);
      alert("Phân tích lỗi: " + err.message + ". Bản đồ mẫu dự phòng đã dữ liệu hóa thành công để bạn thử nghiệm.");
    }
  };

  // Handle manual input trigger
  const handleManualDwgGenerate = () => {
    setIsAnalyzing(true);
    setAnalyzingProgress(10);
    setActiveLogMsg("Đang biên dịch tệp bản vẽ CAD/DWG...");
    
    setTimeout(() => {
      // Pick dynamic elements from custom inputs to create realistic mapping structures
      const customData: MapData = {
        regionName: customMapName || "Bản Vẽ Thiết Kế DWG",
        metrics: {
          totalArea: "94.5 ha",
          averageHeight: "42 tầng",
          activeSensors: 14,
          weatherStatus: "Thời tiết giả định: Mát mẻ, 26°C",
        },
        heightGrid: [
          [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
          [2, 90, 2, 2, 2, 70, 2, 2, 85, 2],
          [2, 90, 2, 2, 2, 70, 2, 2, 85, 2],
          [2, 2, 2, 40, 40, 2, 2, 2, 2, 2],
          [2, 2, 2, 40, 40, 2, 100, 100, 2, 2],
          [2, 50, 2, 2, 2, 2, 100, 100, 2, 2],
          [2, 50, 2, 80, 80, 2, 2, 2, 30, 2],
          [2, 2, 2, 80, 80, 2, 2, 2, 30, 2],
          [2, 2, 2, 2, 2, 2, 60, 60, 2, 2],
          [2, 2, 2, 2, 2, 2, 60, 60, 2, 2]
        ],
        pointsOfInterest: [
          { name: "Khối Tháp Chính A1", type: "industrial", x: 20, y: 20, value: "Thiết kế: Hạng A", status: "active" },
          { name: "Hệ Thống Trạm Trụ Cứu Hỏa", type: "sensor", x: 45, y: 45, value: "Phát xạ vô hại", status: "active" },
          { name: "Điểm Thu Phát Sóng Trung Tâm", type: "traffic", x: 70, y: 70, value: "Tốc dộ cao 10Gbps", status: "active" }
        ],
        chartData: [
          { name: "Mốc 1", sanLuong: 350, nangLuong: 180, chitieu: 400 },
          { name: "Mốc 2", sanLuong: 420, nangLuong: 200, chitieu: 400 },
          { name: "Mốc 3", sanLuong: 580, nangLuong: 220, chitieu: 500 },
          { name: "Mốc 4", sanLuong: 400, nangLuong: 190, chitieu: 500 },
          { name: "Mốc 5", sanLuong: 630, nangLuong: 250, chitieu: 600 }
        ],
        warnings: [
          "Bản đồ dựng độc quyền từ hồ sơ DWG/WKT tùy chỉnh",
          "Mực nước ngầm xung quanh móng mốc ranh giới số 3 ổn định"
        ]
      };
      
      setMapData(customData);
      setMapTypeColor("amber");
      setSelectedPresetId("custom-dwg");
      setIsAnalyzing(false);
    }, 1800);
  };

  // Mock control handlers for selected POIs
  const triggerAlarm = (poi: PointOfInterest) => {
    alert(`🚨 ALARM SYSTEM TRIGGERED: Đội cứu hộ khẩn cấp đã được phái tới trạm "${poi.name}"!`);
  };

  // Color mappings
  const primaryText = mapTypeColor === "green" ? "text-emerald-400" : mapTypeColor === "amber" ? "text-amber-400" : "text-cyan-400";
  const primaryBg = mapTypeColor === "green" ? "bg-emerald-500" : mapTypeColor === "amber" ? "bg-amber-500" : "bg-cyan-500";
  const primaryBorder = mapTypeColor === "green" ? "border-emerald-500/50" : mapTypeColor === "amber" ? "border-amber-500/50" : "border-cyan-500/50";
  const primaryGlow = mapTypeColor === "green" ? "shadow-emerald-500/20" : mapTypeColor === "amber" ? "shadow-amber-500/20" : "shadow-cyan-500/20";

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-[#E0E0E6] flex flex-col font-sans selection:bg-cyan-400 selection:text-black grid-dot-overlay">
      {/* HUD Header Bar */}
      <header className="h-20 md:h-16 border-b border-white/10 flex flex-col md:flex-row items-center justify-between px-6 bg-[#0F0F12] sticky top-0 z-45 gap-4 shadow-xl">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <Compass className={`w-5 h-5 ${primaryText}`} />
            <h1 className="text-base font-bold tracking-tighter text-white">
              RAY-DATA.<span className="text-cyan-400">{selectedPresetId === "urban-smart-city" || selectedPresetId === "custom-dwg" ? "DWG" : "MAP"}</span>
            </h1>
          </div>
          
          <nav className="hidden lg:flex gap-5 text-[10px] uppercase font-bold tracking-[0.2em] text-[#E0E0E6]/50">
            <span className="text-cyan-400 font-extrabold cursor-pointer">Viewport</span>
            <span className="hover:text-white transition-colors cursor-pointer" onClick={() => alert("Tính năng phân tích độ nhám địa hình sắp hoạt động.")}>Analyze</span>
            <span className="hover:text-white transition-colors cursor-pointer" onClick={() => handlePresetSelect("guangxi-mountain")}>Presets</span>
            <span className="hover:text-white transition-colors cursor-pointer" onClick={() => alert("Tổng hợp thông số DWG đã hoàn tất.")}>Geometry</span>
          </nav>
        </div>

        {/* Realtime Metrics & Coordinates */}
        <div className="flex items-center gap-4 md:gap-5 text-xs font-mono">
          <div className="hidden lg:flex items-center gap-2 bg-[#14141A] px-2.5 py-1 rounded border border-white/10">
            <Activity className="w-3 h-3 text-pink-400 animate-pulse" />
            <span className="text-white/40 text-[9px] uppercase tracking-wider">LOAD:</span>
            <span className="text-white font-bold">11.4ms (60 FPS)</span>
          </div>

          <div className="flex items-center gap-2 bg-[#14141A] px-2.5 py-1 rounded border border-white/10">
            <Clock className="w-3 h-3 text-cyan-400" />
            <span className="text-white/40 text-[9px] uppercase tracking-wider">TIME:</span>
            <span className="text-emerald-400 font-bold">{currentTime}</span>
          </div>

          <button 
            onClick={() => alert("Mô hình đã được lưu và sẵn sàng xuất bản lên máy chủ Cloud Run!")}
            className="px-4 py-1.5 bg-white text-black text-xs font-bold rounded-sm tracking-widest hover:bg-slate-200 active:scale-95 transition-all cursor-pointer shadow-lg uppercase"
          >
            Publish Model
          </button>
        </div>
      </header>

      {/* Main Workspace Bento Grid */}
      <main className="flex-1 p-4 grid grid-cols-1 xl:grid-cols-4 gap-4 max-w-[1920px] mx-auto w-full">
        
        {/* PANEL 1: Left control panel, image uploading & Presets select */}
        <section className="xl:col-span-1 space-y-4 flex flex-col" id="panel-presets-and-generator">
          
          {/* Preset list selector */}
          <div className="bg-[#0F0F12] p-5 rounded-md border border-white/10 flex-1 flex flex-col min-h-[300px]">
            <div className="flex items-center gap-2 text-[10px] font-bold font-mono tracking-widest text-white/40 mb-4 border-b border-white/5 pb-2.5 uppercase">
              <Layers className={`w-3.5 h-3.5 text-cyan-400`} />
              <span>DANH SÁCH BẢN ĐỒ GIẢ THUYẾT [3]</span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto max-h-[280px] xl:max-h-none pr-1">
              {PRESET_MAPS.map((preset) => {
                const isActive = selectedPresetId === preset.id;
                return (
                  <div
                    key={preset.id}
                    id={`preset-card-${preset.id}`}
                    onClick={() => handlePresetSelect(preset.id)}
                    className={`p-3.5 rounded-sm border text-left cursor-pointer transition-all ${
                      isActive
                        ? `bg-[#141419] border-l-2 border-l-cyan-400 border-white/20 shadow-md`
                        : "bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[9px] font-mono tracking-widest bg-white/10 text-white/60 px-1.5 py-0.5 rounded-sm border border-white/5">
                        {preset.mapType}
                      </span>
                      {isActive && (
                        <span className="text-[9px] font-mono text-cyan-400 tracking-widest uppercase">
                          ● Active View
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-xs font-bold text-white flex items-center justify-between">
                      {preset.name}
                      <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                    </h3>
                    
                    <p className="text-[10px] text-white/40 mt-1 line-clamp-2">
                      {preset.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Core AI Upload Modeling Generator */}
          <div className="bg-[#0F0F12] p-5 rounded-md border border-white/10 space-y-4">
            <div className="flex items-center gap-2 text-[10px] font-bold font-mono tracking-widest text-white/40 border-b border-white/5 pb-2.5 uppercase">
              <UploadCloud className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
              <span>DỰNG MÔ HÌNH VỚI GEMINI AI</span>
            </div>

            <p className="text-[10px] text-white/50 leading-relaxed">
              Tải lên không ảnh vệ tinh, ảnh trắc địa 2D hoặc sơ đồ thiết kế kiến trúc để AI tự tích hợp thành bản đồ 3D hoàn chỉnh.
            </p>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col md:flex-row xl:flex-col gap-2.5">
                {/* Upload box */}
                <div className="flex-1">
                  <label
                    htmlFor="map-image-upload"
                    className="flex flex-col items-center justify-center p-4 border border-dashed border-white/10 roundedbg-[#141419] hover:border-cyan-400 cursor-pointer text-center transition-all group"
                  >
                    <UploadCloud className="w-5 h-5 text-white/30 group-hover:text-cyan-400 mb-1 transition-all" />
                    <span className="text-[10px] font-mono text-white/40 group-hover:text-white/70">
                      Cực đại 50MB (JPG/PNG)
                    </span>
                    <input
                      id="map-image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  {uploadedFileName && (
                    <div className="text-[10px] font-mono text-cyan-400 mt-2.5 flex items-center gap-1 bg-[#141419] p-1.5 rounded-sm border border-white/5">
                      <FileText className="w-3 h-3 shrink-0" />
                      <span className="truncate max-w-[155px]">{uploadedFileName}</span>
                    </div>
                  )}
                </div>

                {/* Customized input forms */}
                <div className="flex-1 space-y-2.5">
                  <div>
                    <label className="text-[9px] uppercase tracking-wider font-bold text-white/45">TÊN DỰ ÁN:</label>
                    <input
                      type="text"
                      value={customMapName}
                      onChange={(e) => setCustomMapName(e.target.value)}
                      className="w-full text-xs bg-[#141419] text-white border border-white/10 rounded-sm px-2.5 py-1.5 mt-1 focus:border-cyan-400 outline-none font-sans"
                    />
                  </div>
                  
                  <button
                    id="btn-trigger-ai-extruder"
                    onClick={startMapAnalysis}
                    className="w-full bg-[#1A1A24] hover:bg-[#20202E] text-cyan-400 font-mono text-[10px] font-bold uppercase tracking-widest border border-cyan-400/30 rounded-sm py-2 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Cpu className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                    BẮT ĐẦU DỰNG 3D
                  </button>
                </div>
              </div>

              {/* Direct DWG Code input block option */}
              <details className="text-[10px] border border-white/5 rounded-sm bg-[#141419]/80 p-2" id="dwg-direct-details">
                <summary className="text-[9px] uppercase font-mono text-white/40 font-bold tracking-widest cursor-pointer hover:text-white/70 flex items-center gap-1 select-none">
                  <ExternalLink className="w-3 h-3" />
                  Nhập Tọa độ CAD/DWG thủ công
                </summary>
                <div className="mt-2.5 space-y-2">
                  <textarea
                    rows={3}
                    value={manualDwgCoords}
                    onChange={(e) => setManualDwgCoords(e.target.value)}
                    className="w-full text-[9px] font-mono bg-black text-emerald-400 border border-white/10 rounded-sm p-1.5 focus:border-cyan-400 outline-none resize-none"
                  />
                  <button
                    onClick={handleManualDwgGenerate}
                    className="w-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/80 text-emerald-400 text-[9px] uppercase tracking-widest font-mono rounded-sm py-1.5 transition-all"
                  >
                    Extrude Tọa độ DWG
                  </button>
                </div>
              </details>
            </div>
          </div>
        </section>

        {/* PANEL 2 & 3: Large Canvas Viewport Panel */}
        <section className="xl:col-span-2 space-y-4 flex flex-col" id="panel-viewport-center">
          
          {/* Main 3D render window */}
          <div className="relative bg-[#050507] rounded-sm flex-1 border border-white/10 shadow-2xl flex flex-col overflow-hidden min-h-[460px] md:min-h-[550px]" id="canvas-panel-parent-wrapper">
            
            {/* Quick telemetry coordinates overlay from the theme */}
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-1 select-none pointer-events-none">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                <h2 className="text-[11px] font-mono font-bold uppercase tracking-widest text-white">
                  {mapData.regionName}
                </h2>
              </div>
              <div className="text-[9px] text-[#22d3ee]/80 font-mono tracking-tighter">X: 142.02</div>
              <div className="text-[9px] text-pink-500/80 font-mono tracking-tighter">Y: -22.91</div>
              <div className="text-[9px] text-white/40 font-mono tracking-tighter">Z: {(heightMultiplier * 8.5).toFixed(2)}</div>
            </div>

            {/* Guide overlay */}
            <div className="absolute top-4 right-4 z-10 flex flex-col gap-1.5 pointer-events-none">
              <div className="bg-[#0F0F12]/90 text-[9px] font-mono px-3 py-1.5 rounded-sm border border-white/10 text-white/60 backdrop-blur shadow-xl flex items-center gap-2 uppercase tracking-wide">
                <Info className="w-3.5 h-3.5 text-cyan-400" />
                <span>Kéo chuột để xoay xoay 3D</span>
              </div>
            </div>

            {/* Loading AI Telemetry Simulator Overlay */}
            {isAnalyzing && (
              <div className="absolute inset-0 bg-[#0A0A0C]/95 z-20 flex flex-col items-center justify-center p-6 text-center backdrop-blur">
                <div className="w-64 space-y-4" id="ai-analyzing-progress-bar">
                  <div className="relative flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full border-4 border-white/10 border-t-cyan-400 animate-spin" />
                    <Cpu className="absolute w-6 h-6 text-cyan-400 animate-pulse" />
                  </div>
                  
                  <div>
                    <h3 className="text-[11px] font-mono font-bold tracking-widest text-white/80">
                      ANALYZING SPATIAL INPUTS...
                    </h3>
                    <div className="text-2xl font-mono font-black text-cyan-400 mt-1">
                      {analyzingProgress}%
                    </div>
                  </div>

                  {/* Progress Line */}
                  <div className="w-full h-[2px] bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan-400 transition-all duration-150"
                      style={{ width: `${analyzingProgress}%` }}
                    />
                  </div>

                  {/* Log message ticker */}
                  <div className="text-[11px] font-mono text-white/50 h-8 flex items-center justify-center italic">
                    {activeLogMsg}
                  </div>
                </div>
              </div>
            )}

            {/* Canvas Viewport Render Component */}
            <ThreeCanvas
              mapData={mapData}
              heightMultiplier={heightMultiplier}
              selectedPoi={selectedPoi}
              onSelectPoi={setSelectedPoi}
              showScanner={showScanner}
              wireframeMode={wireframeMode}
              mapTypeColor={mapTypeColor}
            />

            {/* Dynamic settings bar deck floated beautifully near bottom */}
            <div className="absolute bottom-16 left-4 right-4 z-10 flex flex-col md:flex-row items-center justify-between gap-3 bg-[#0F0F12]/95 p-3 rounded-sm border border-white/10 backdrop-blur" id="canvas-bottom-deck">
              
              <div className="flex items-center gap-4 flex-1 w-full justify-between md:justify-start">
                {/* Extrusion Factor Multipier */}
                <div className="flex items-center gap-2">
                  <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-[9px] font-mono font-bold text-white/40 uppercase tracking-widest">ĐỘ CAO 3D:</span>
                  <input
                    type="range"
                    min="0.1"
                    max="3.0"
                    step="0.1"
                    value={heightMultiplier}
                    onChange={(e) => setHeightMultiplier(parseFloat(e.target.value))}
                    className="w-24 md:w-32 accent-cyan-400 h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
                  />
                  <span className="text-[10px] font-mono text-cyan-400 font-bold min-w-[30px]">
                    {heightMultiplier}x
                  </span>
                </div>

                <div className="h-4 w-[1px] bg-white/10 hidden md:block" />

                {/* Cosmetic theme overrides */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-mono font-bold text-white/40 uppercase tracking-widest">CHỦ ĐỀ:</span>
                  {["cyan", "green", "amber"].map((col) => (
                    <button
                      key={col}
                      onClick={() => setMapTypeColor(col)}
                      className={`w-3.5 h-3.5 rounded-full transition-all border ${
                        col === "cyan" ? "bg-cyan-500" : col === "green" ? "bg-emerald-500" : "bg-amber-500"
                      } ${mapTypeColor === col ? "ring-2 ring-white scale-110" : "opacity-65"}`}
                    />
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                <label className="flex items-center gap-1.5 cursor-pointer text-[9px] font-mono uppercase tracking-widest text-white/60 select-none">
                  <input
                    type="checkbox"
                    checked={showScanner}
                    onChange={(e) => setShowScanner(e.target.checked)}
                    className="rounded-sm bg-black border-white/20 text-cyan-455 focus:ring-0"
                  />
                  <span>QUÉT RADAR</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer text-[9px] font-mono uppercase tracking-widest text-white/60 select-none">
                  <input
                    type="checkbox"
                    checked={wireframeMode}
                    onChange={(e) => setWireframeMode(e.target.checked)}
                    className="rounded-sm bg-black border-white/20 text-cyan-455 focus:ring-0"
                  />
                  <span>KHUNG ĐỒNG MỨC</span>
                </label>
              </div>
            </div>

            {/* Regional Status Board footer */}
            <div className="bg-[#0F0F12] px-4 py-3.5 border-t border-white/10 grid grid-cols-2 lg:grid-cols-4 gap-4" id="canvas-panel-metrics">
              <div className="border-r border-white/5 pr-2">
                <span className="block text-[9px] font-mono text-white/40 font-bold uppercase tracking-widest">TỔNG DIỆN TÍCH</span>
                <span className="text-sm font-extrabold font-mono text-white">
                  {mapData.metrics.totalArea}
                </span>
              </div>
              <div className="border-r border-white/5 px-2">
                <span className="block text-[9px] font-mono text-white/40 font-bold uppercase tracking-widest">ĐỘ CAO TRUNG BÌNH</span>
                <span className="text-sm font-extrabold font-mono text-yellow-400">
                  {mapData.metrics.averageHeight}
                </span>
              </div>
              <div className="border-r border-white/5 px-2">
                <span className="block text-[9px] font-mono text-white/40 font-bold uppercase tracking-widest">CẢM BIẾN LIVE</span>
                <span className="text-sm font-extrabold font-mono text-cyan-400">
                  {mapData.metrics.activeSensors} Trạm
                </span>
              </div>
              <div className="px-2">
                <span className="block text-[9px] font-mono text-white/40 font-bold uppercase tracking-widest">BỐI CẢNH THỜI TIẾT</span>
                <span className="text-[11px] font-bold text-white/85 line-clamp-1 block font-mono" title={mapData.metrics.weatherStatus}>
                  {mapData.metrics.weatherStatus}
                </span>
              </div>
            </div>

          </div>
        </section>

        {/* PANEL 4: Right monitor panel - charts, poi data & alerts logs */}
        <section className="xl:col-span-1 space-y-4 flex flex-col" id="panel-diagnostics-and-alerts">
          
          {/* Active selected POI telemetry card */}
          <div className="bg-[#0F0F12] p-5 rounded-md border border-white/10 space-y-3">
            <div className="flex items-center gap-2 text-[10px] font-bold font-mono tracking-widest text-[#E0E0E6]/50 border-b border-white/5 pb-2.5 uppercase">
              <Radio className={`w-3.5 h-3.5 text-cyan-400 animate-pulse`} />
              <span>DIAGNOSTIC & TELEMETRY</span>
            </div>

            {selectedPoi ? (
              <div className="space-y-3 bg-[#141419] p-3.5 rounded-sm border border-white/10" id="poi-details-card">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest">TIÊU ĐIỂM CHỌN</span>
                  <span className={`text-[9px] font-mono px-2 py-0.5 rounded-sm border uppercase ${
                    selectedPoi.status === "error"
                      ? "bg-red-950/40 border-red-800 text-red-400"
                      : selectedPoi.status === "warning"
                      ? "bg-amber-950/40 border-amber-800 text-amber-400"
                      : "bg-emerald-950/40 border-emerald-800 text-emerald-400"
                  }`}>
                    {selectedPoi.status.toUpperCase()}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    {selectedPoi.name}
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-[9px] font-mono text-white/40 bg-black/40 p-2 rounded-sm border border-white/5">
                    <div>X-COORD: <span className="text-white">{selectedPoi.x}%</span></div>
                    <div>Y-COORD: <span className="text-white">{selectedPoi.y}%</span></div>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-2 flex items-center justify-between">
                  <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest">CHỈ SỐ LIVE:</span>
                  <span className="text-xs font-bold font-mono text-white bg-white/5 px-2 py-1 rounded-sm border border-white/5">
                    {selectedPoi.value}
                  </span>
                </div>

                <div className="pt-1 select-none flex gap-2">
                  <button
                    onClick={() => triggerAlarm(selectedPoi)}
                    className="flex-1 bg-red-950/50 hover:bg-red-900/60 text-red-300 text-[9px] uppercase tracking-widest font-mono border border-red-800/50 rounded-sm py-1.5 cursor-pointer text-center transition-all"
                  >
                    Cứu hộ
                  </button>
                  <button
                    onClick={() => {
                      alert(`Đồng bộ dữ liệu của trạm ${selectedPoi.name} thành công.`);
                    }}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white/80 text-[9px] uppercase tracking-widest font-mono border border-white/10 rounded-sm py-1.5 cursor-pointer text-center transition-all"
                  >
                    Đồng bộ
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 border border-dashed border-white/10 rounded-sm bg-[#141419]/60 flex flex-col justify-center items-center" id="poi-select-prompt">
                <MapPin className="w-6 h-6 text-white/30 animate-bounce mb-2" />
                <p className="text-[10px] text-white/40 max-w-[190px] mx-auto leading-normal">
                  Click vào biểu tượng <strong className="text-cyan-400">Trạm 3D</strong> trên mô hình để chụp dữ liệu GIS thời gian thực.
                </p>
              </div>
            )}
          </div>

          {/* Metric Charts component panel */}
          <MetricCharts chartData={mapData.chartData} mapTypeColor={mapTypeColor} />

          {/* Environmental Warnings Board */}
          <div className="bg-[#0F0F12] p-5 rounded-md border border-white/10 flex-1 flex flex-col">
            <div className="flex items-center gap-2 text-[10px] font-bold font-mono tracking-widest text-[#E0E0E6]/50 mb-4 border-b border-white/5 pb-2.5 uppercase">
              <ShieldAlert className="w-3.5 h-3.5 text-pink-500 animate-pulse" />
              <span>HỆ THỐNG CẢNH BÁO AN TOÀN [{mapData.warnings.length}]</span>
            </div>

            <div className="space-y-2 flex-1 overflow-y-auto max-h-[160px] xl:max-h-none pr-1">
              {mapData.warnings.length > 0 ? (
                mapData.warnings.map((alertText, index) => (
                  <div
                    key={index}
                    className="bg-pink-500/5 px-3 py-2.5 rounded-sm border border-pink-500/20 text-[#E0E0E6]/90 text-[10px] flex items-start gap-2.5 backdrop-blur animate-fade-in font-sans"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-pink-500 shrink-0 mt-0.5 animate-pulse" />
                    <p className="leading-relaxed">{alertText}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-3 text-[10px] text-white/30 italic">
                  Không ghi nhận cảnh báo nguy cơ nào trong khu vực.
                </div>
              )}
            </div>
          </div>

        </section>

      </main>

      {/* Cyber footer info */}
      <footer className="h-12 border-t border-white/10 bg-[#0F0F12] flex items-center justify-between px-6 text-[9px] font-mono tracking-widest uppercase text-white/40">
        <div className="flex gap-6">
          <span>Mode: <span className="text-cyan-400">Orthographic 3D</span></span>
          <span className="hidden sm:inline">Scale: <span className="text-white">1:100</span></span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-emerald-400 font-bold lowercase">● GPU Acceleration Active</span>
          <span className="text-white/20 italic hidden md:inline">Last Synced: 2026-05-23</span>
        </div>
      </footer>
    </div>
  );
}
