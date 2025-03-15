
import { HealthScore } from "@/types/BloodTest";
import { format } from "date-fns";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface HealthScoreChartProps {
  data: HealthScore[];
}

export const HealthScoreChart = ({ data }: HealthScoreChartProps) => {
  const formattedData = data.map(item => ({
    date: format(new Date(item.date), 'MMM d'),
    score: Math.round(item.score),
    fullDate: format(new Date(item.date), 'MMM d, yyyy')
  })).sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime());

  const getScoreColor = (score: number) => {
    if (score >= 90) return "#10b981"; // Green
    if (score >= 75) return "#22c55e"; // Light green
    if (score >= 60) return "#facc15"; // Yellow
    if (score >= 40) return "#f97316"; // Orange
    return "#ef4444"; // Red
  };

  const scoreConfig = {
    score: {
      label: "Health Score",
      color: "#3b82f6"
    }
  };

  return (
    <div className="w-full">
      <h4 className="text-lg font-medium mb-4">Health Score Trend</h4>
      
      <div className="h-[300px]">
        <ChartContainer config={scoreConfig}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={formattedData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tickMargin={10}
              />
              <YAxis 
                domain={[0, 100]} 
                axisLine={false}
                tickLine={false}
                tickMargin={10}
              />
              <Tooltip content={<ChartTooltipContent labelClassName="font-medium" />} />
              <Line
                type="monotone"
                dataKey="score"
                name="score"
                stroke="#3b82f6"
                strokeWidth={2}
                activeDot={{ r: 8 }}
                dot={(props) => {
                  const { cx, cy, payload } = props;
                  return (
                    <circle 
                      cx={cx} 
                      cy={cy} 
                      r={4} 
                      fill={getScoreColor(payload.score)} 
                      stroke="#fff" 
                      strokeWidth={2}
                    />
                  );
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
      
      <div className="flex justify-center mt-4">
        <div className="flex gap-4">
          <div className="flex items-center">
            <span className="w-3 h-3 block rounded-full bg-[#10b981] mr-2"></span>
            <span className="text-xs">Excellent (90+)</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 block rounded-full bg-[#22c55e] mr-2"></span>
            <span className="text-xs">Good (75-89)</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 block rounded-full bg-[#facc15] mr-2"></span>
            <span className="text-xs">Average (60-74)</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 block rounded-full bg-[#ef4444] mr-2"></span>
            <span className="text-xs">Poor (&lt;60)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
