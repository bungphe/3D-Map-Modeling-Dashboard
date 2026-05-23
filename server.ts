import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Increase payload limit to handle base64 image uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Initialize Google GenAI
const getAIClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("⚠️ Warning: GEMINI_API_KEY is not defined. Using mockup analyzer backend.");
    return null;
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// API Endpoint to analyze 2D map/blueprint image and convert to structured 3D map data
app.post("/api/analyze-map", async (req, res) => {
  try {
    const { image, mapName, mapType } = req.body;
    
    // Fallback Mock Data in case Gemini isn't available or fails
    const getFallbackData = (name: string, type: string) => {
      const sanitizedName = name || "Khu Vực Phân Tích";
      return {
        regionName: sanitizedName,
        metrics: {
          totalArea: "15,480 ha",
          averageHeight: "245 m",
          activeSensors: 24,
          weatherStatus: "Mưa nhẹ đầu mùa, nhiệt độ từ 22°C - 27°C",
        },
        heightGrid: [
          [2, 3, 5, 8, 12, 16, 12, 8, 4, 2],
          [2, 4, 7, 10, 15, 20, 15, 10, 5, 2],
          [3, 6, 10, 15, 25, 30, 25, 15, 7, 3],
          [5, 10, 15, 25, 40, 45, 35, 20, 10, 4],
          [8, 12, 20, 35, 50, 55, 40, 25, 12, 5],
          [6, 10, 18, 30, 45, 48, 38, 22, 10, 4],
          [4, 8, 12, 20, 30, 35, 28, 15, 8, 3],
          [3, 5, 8, 12, 18, 22, 18, 10, 5, 2],
          [2, 3, 5, 8, 10, 12, 10, 7, 4, 1],
          [1, 2, 3, 4, 6, 8, 6, 4, 2, 1]
        ],
        pointsOfInterest: [
          { name: "Trạm Quan Trắc Trung Tâm", type: "weather", x: 45, y: 55, value: "24.5°C", status: "active" },
          { name: "Khu Phức Hợp Sản Xuất Thủy Điện", type: "industrial", x: 30, y: 40, value: "Hoạt động: 92%", status: "active" },
          { name: "Trạm Đo Lưu Lượng Sông", type: "sensor", x: 75, y: 35, value: "Lưu lượng: 120m3/s", status: "warning" },
          { name: "Cửa Ngõ Giao Thông Bắc", type: "traffic", x: 50, y: 15, value: "Ổn định", status: "active" },
          { name: "Trạm Phát Điện Dự Phòng", type: "industrial", x: 65, y: 70, value: "Bảo trì", status: "warning" }
        ],
        chartData: [
          { name: "Tháng 1", sanLuong: 400, nangLuong: 240, chitieu: 200 },
          { name: "Tháng 2", sanLuong: 300, nangLuong: 139, chitieu: 220 },
          { name: "Tháng 3", sanLuong: 200, nangLuong: 980, chitieu: 229 },
          { name: "Tháng 4", sanLuong: 278, nangLuong: 390, chitieu: 200 },
          { name: "Tháng 5", sanLuong: 189, nangLuong: 480, chitieu: 218 },
          { name: "Tháng 6", sanLuong: 239, nangLuong: 380, chitieu: 250 },
          { name: "Tháng 7", sanLuong: 349, nangLuong: 430, chitieu: 210 }
        ],
        warnings: [
          "Lưu lượng dòng chảy sông Son tăng nhẹ 1.2m vượt mức trung bình",
          "Bộ cảm biến CO2 tại khu công nghiệp phía Đông báo chỉ số PM2.5 tăng nhẹ",
          "Trạm dự phòng phía Nam chuẩn bị bảo trì định kỳ lúc 02:00 ngày mai"
        ]
      };
    };

    const ai = getAIClient();
    if (!ai || !image) {
      console.log("No Gemini API Client configured or no image provided, using mock fallback data.");
      return res.json(getFallbackData(mapName, mapType));
    }

    // Clean image data prefix if exists
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const mimeType = image.match(/^data:(image\/\w+);base64,/)?.[1] || "image/png";

    const systemPrompt = `You are an architectural 3D layout planner and geographic GIS analyzer.
Analyze this 2D map, satellite photo, elevation contour profile, CAD/DWG draft, or blueprint image.
Your task is to extract a logical 3D elevation map, points of interest, and contextual environmental indicators for high-tech HUD visualization (just like a smart city / digital twin command dashboard).

Return a JSON object conforming strictly to the provided responseSchema.
Make sure the heightGrid is exactly a 10x10 array of integers (range 0 to 100), simulating the 3D terrain profile of the map. Areas with mountains, towers, buildings, or elevated contours should have higher values (e.g. 30-85), while valleys, plains, waters, or floors should have lower values (e.g. 0-25).
Create Logical points of interest (5-8 locations) with precise normalized percentage coordinates (x: 0-100, y: 0-100) matching visual highlights in the image.
Include realistic metrics, mock telemetry chart datasets (7 columns matching monthly metrics (sanLuong, nangLuong, chitieu)), and brief contextual Vietnam-focused smart city/utility warnings based on the map's visual elements.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        {
          inlineData: {
            mimeType: mimeType,
            data: base64Data,
          },
        },
        {
          text: `Evaluate this 2D map image of type ${mapType || "AutoDraw"} representing "${mapName || "Unnamed area"}". Generate regional analysis data matching the image contours/buildings.`
        }
      ],
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["regionName", "metrics", "heightGrid", "pointsOfInterest", "chartData", "warnings"],
          properties: {
            regionName: {
              type: Type.STRING,
              description: "E.g., Bán đảo Sơn Trà, Khu công nghệ cao Hòa Lạc, Central Smart City Complex, etc."
            },
            metrics: {
              type: Type.OBJECT,
              required: ["totalArea", "averageHeight", "activeSensors", "weatherStatus"],
              properties: {
                totalArea: { type: Type.STRING, description: "Total land area estimated from scale e.g. '1,200 ha'" },
                averageHeight: { type: Type.STRING, description: "Average point elevation e.g. '45 m' or height '12 stories'" },
                activeSensors: { type: Type.INTEGER, description: "Active points/monitors counted" },
                weatherStatus: { type: Type.STRING, description: "Appropriate weather context based on satellite/blueprint e.g. 'Nắng ráo, gió nhẹ 12km/h'" }
              }
            },
            heightGrid: {
              type: Type.ARRAY,
              description: "Exactly a 10x10 grid of integer heights (0-100) representing topography. Higher values where mountains, shapes, or building blocks stand out.",
              items: {
                type: Type.ARRAY,
                items: { type: Type.INTEGER }
              }
            },
            pointsOfInterest: {
              type: Type.ARRAY,
              description: "List of logical infrastructure facilities, tourist landmarks or weather stations spotted or proposed.",
              items: {
                type: Type.OBJECT,
                required: ["name", "type", "x", "y", "value", "status"],
                properties: {
                  name: { type: Type.STRING, description: "Name of the station or point of interest" },
                  type: { type: Type.STRING, description: "One of: weather, industrial, sensor, traffic, residential, ecological" },
                  x: { type: Type.INTEGER, description: "X percentage position (0-100) relative to image left edge" },
                  y: { type: Type.INTEGER, description: "Y percentage position (0-100) relative to image top edge" },
                  value: { type: Type.STRING, description: "Short live telemetry reading e.g. '28.3°C', '95% rH', 'Độ ẩm đất 42%'" },
                  status: { type: Type.STRING, description: "active, warning, or error" }
                }
              }
            },
            chartData: {
              type: Type.ARRAY,
              description: "7 records for chronological data trends representing output vs resources used.",
              items: {
                type: Type.OBJECT,
                required: ["name", "sanLuong", "nangLuong", "chitieu"],
                properties: {
                  name: { type: Type.STRING, description: "Chronological point e.g. 'Tháng 1'" },
                  sanLuong: { type: Type.INTEGER, description: "Simulated output value (e.g. production, occupancy, rainfall)" },
                  nangLuong: { type: Type.INTEGER, description: "Simulated power/raw materials used" },
                  chitieu: { type: Type.INTEGER, description: "Simulated targeted benchmark index" }
                }
              }
            },
            warnings: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Contextual warning logs / notices tailored to this map (provide in Vietnamese)."
            }
          }
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Empty response from Gemini API");
    }

    const data = JSON.parse(resultText);
    res.json(data);
  } catch (error: any) {
    console.error("Gemini map analysis failed:", error);
    res.status(500).json({ error: "Lỗi phân tích bản đồ: " + error.message });
  }
});

// Serve frontend assets in production and mount Vite middleware in development
const startServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Fully functional Full-Stack Server running on http://localhost:${PORT}`);
  });
};

startServer().catch((err) => {
  console.error("Failed to start full stack Express/Vite server:", err);
});
