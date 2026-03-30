import { useProductivityData } from "@/hooks/use-analytics";
import { Card } from "@/components/UI";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";

export default function Analytics() {
  const { data, isLoading } = useProductivityData();

  if (isLoading) return <div className="p-8 text-primary font-mono animate-pulse">Compiling Analytics Matrix...</div>;
  if (!data) return <div className="p-8 text-destructive font-mono">Analytics offline.</div>;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-white">Macro Analytics</h1>
        <p className="text-muted-foreground mt-1 text-sm font-mono">Aggregated departmental performance metrics.</p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="h-[400px] flex flex-col">
          <h3 className="font-bold text-white mb-4">Departmental Efficacy</h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.departmentMetrics} margin={{top: 20, right: 30, left: 0, bottom: 0}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="department" stroke="#ffffff50" tick={{fill: '#ffffff80', fontSize: 12}} />
                <YAxis yAxisId="left" orientation="left" stroke="#ffffff50" tick={{fill: '#ffffff80', fontSize: 12}} />
                <YAxis yAxisId="right" orientation="right" stroke="hsl(190 90% 50%)" tick={{fill: '#ffffff80', fontSize: 12}} />
                <Tooltip contentStyle={{backgroundColor: '#111115', borderColor: '#1f1f2e', borderRadius: '8px'}} cursor={{fill: '#ffffff05'}} />
                <Legend wrapperStyle={{fontSize: '12px', color: '#ffffff80'}} />
                <Bar yAxisId="left" dataKey="tasksCompleted" name="Tasks" fill="hsl(250 89% 65%)" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="avgProductivity" name="Score" fill="hsl(190 90% 50%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Pseudo-Heatmap representation */}
        <Card>
          <h3 className="font-bold text-white mb-4">System Stress Heatmap (Simulated)</h3>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 7 * 5 }).map((_, i) => {
              const intensity = Math.random();
              return (
                <div 
                  key={i} 
                  className="aspect-square rounded-md border border-black/50 transition-all hover:scale-110 cursor-crosshair"
                  style={{
                    backgroundColor: `hsla(190, 90%, 50%, ${intensity * 0.8})`,
                    boxShadow: intensity > 0.8 ? '0 0 10px rgba(0,255,255,0.4)' : 'none'
                  }}
                  title={`Stress Level: ${(intensity*100).toFixed(0)}%`}
                />
              );
            })}
          </div>
          <div className="flex justify-between mt-4 text-xs font-mono text-muted-foreground">
            <span>Low Stress</span>
            <span>Critical Load</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
