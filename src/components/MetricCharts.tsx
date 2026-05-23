import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import { ChartRecord } from "../types";

interface MetricChartsProps {
  chartData: ChartRecord[];
  mapTypeColor: string; // 'cyan' | 'green' | 'amber'
}

export default function MetricCharts({ chartData, mapTypeColor }: MetricChartsProps) {
  // Map theme strings to Hex codes
  const primaryColor = mapTypeColor === "green" ? "#10b981" : mapTypeColor === "amber" ? "#f59e0b" : "#00f0ff";
  const secondaryColor = "#bd00ff"; // pink purple contrast
  const tertiaryColor = "#3b82f6"; // blue contrast

  return (
    <div className="space-y-4" id="dashboard-metrics-graphics">
      {/* Chart 1: Bar Chart displaying Output & targeted benchmark index */}
      <div className="bg-[#0F0F12] p-5 rounded-md border border-white/10" id="bar-chart-output-metrics">
        <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2.5">
          <span className="text-[10px] font-mono font-bold tracking-widest text-[#E0E0E6]/50 uppercase">
            [ 01 ] ĐỒ THỊ THỦY VĂN & SẢN LƯỢNG
          </span>
          <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-widest">LIVE COORDS</span>
        </div>
        
        <div className="h-44 w-full text-white">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 5, left: -25, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" opacity={0.6} />
              <XAxis
                dataKey="name"
                stroke="rgba(255,255,255,0.4)"
                fontSize={9}
                tickLine={false}
              />
              <YAxis stroke="rgba(255,255,255,0.4)" fontSize={9} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0F0F12",
                  borderColor: "rgba(255,255,255,0.15)",
                  borderRadius: "2px",
                  color: "#fff",
                  fontFamily: "monospace",
                  fontSize: "11px",
                }}
              />
              <Legend verticalAlign="top" height={24} iconSize={8} wrapperStyle={{ fontSize: 9, color: '#fff' }} />
              <Bar
                name="Sản Lượng Đo"
                dataKey="sanLuong"
                fill={primaryColor}
                radius={[1, 1, 0, 0]}
              />
              <Bar
                name="Hạn Mức Định Biên"
                dataKey="chitieu"
                fill={secondaryColor}
                radius={[1, 1, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Area Curve chart displaying Energy/Raw consumption */}
      <div className="bg-[#0F0F12] p-5 rounded-md border border-white/10" id="area-chart-resource-metrics">
        <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2.5">
          <span className="text-[10px] font-mono font-bold tracking-widest text-[#E0E0E6]/50 uppercase">
            [ 02 ] NĂNG LƯỢNG & HAO PHÍ
          </span>
          <span className="text-[9px] font-mono text-pink-400 animate-pulse uppercase tracking-widest">MONITORING</span>
        </div>

        <div className="h-40 w-full text-white">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 5, right: 5, left: -25, bottom: 5 }}
            >
              <defs>
                <linearGradient id="colorNangLuong" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={secondaryColor} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={secondaryColor} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorSanLuong" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={primaryColor} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={primaryColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" opacity={0.6} />
              <XAxis
                dataKey="name"
                stroke="rgba(255,255,255,0.4)"
                fontSize={9}
                tickLine={false}
              />
              <YAxis stroke="rgba(255,255,255,0.4)" fontSize={9} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0F0F12",
                  borderColor: "rgba(255,255,255,0.15)",
                  borderRadius: "2px",
                  color: "#fff",
                  fontFamily: "monospace",
                  fontSize: "11px",
                }}
              />
              <Legend verticalAlign="top" height={24} iconSize={8} wrapperStyle={{ fontSize: 9 }} />
              <Area
                name="Điện Năng Hệ Thống (MWh)"
                type="monotone"
                dataKey="nangLuong"
                stroke={secondaryColor}
                fillOpacity={1}
                fill="url(#colorNangLuong)"
              />
              <Area
                name="Năng Lượng Dự Phòng"
                type="monotone"
                dataKey="sanLuong"
                stroke={tertiaryColor}
                fillOpacity={1}
                fill="url(#colorSanLuong)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
