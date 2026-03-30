import { useDashboardData, useActivityFeed } from "@/hooks/use-analytics";
import { Card, Badge } from "@/components/UI";
import { motion } from "framer-motion";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, BarChart, Bar } from "recharts";
import { Activity, AlertTriangle, CheckCircle2, Clock, Server } from "lucide-react";
import { format } from "date-fns";

export default function Dashboard() {
  const { data: analytics, isLoading: analyticsLoading } = useDashboardData();
  const { data: activity, isLoading: activityLoading } = useActivityFeed();

  if (analyticsLoading || activityLoading) {
    return <div className="flex h-96 items-center justify-center text-primary animate-pulse">Initializing Telemetry...</div>;
  }

  if (!analytics) return <div className="text-destructive">Failed to load analytics</div>;

  const COLORS = ['hsl(190 90% 50%)', 'hsl(250 89% 65%)', 'hsl(150 80% 50%)', 'hsl(340 80% 60%)'];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">System Telemetry</h1>
        <p className="text-muted-foreground font-mono text-sm">LIVE FEED • {format(new Date(), 'HH:mm:ss')} UTC</p>
      </header>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Active Workflows", val: analytics.activeWorkflows, icon: Activity, color: "text-primary" },
          { title: "SLA Violations", val: analytics.slaViolations, icon: AlertTriangle, color: "text-destructive" },
          { title: "Tasks Completed", val: analytics.completedTasks, icon: CheckCircle2, color: "text-emerald-400" },
          { title: "Avg Productivity", val: `${analytics.avgProductivityScore.toFixed(1)}%`, icon: Clock, color: "text-accent" },
        ].map((kpi, i) => (
          <Card key={i} glow className="relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <kpi.icon className="w-32 h-32" />
            </div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <h3 className="text-muted-foreground font-medium">{kpi.title}</h3>
              <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
            </div>
            <p className="text-4xl font-display font-bold text-white relative z-10">{kpi.val}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <Card className="col-span-1 lg:col-span-2 flex flex-col">
          <h3 className="text-lg font-bold text-white mb-6">Task Completion Velocity</h3>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.taskCompletionTrend}>
                <defs>
                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(190 90% 50%)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(190 90% 50%)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#ffffff40" tick={{fill: '#ffffff80', fontSize: 12}} />
                <YAxis stroke="#ffffff40" tick={{fill: '#ffffff80', fontSize: 12}} />
                <Tooltip contentStyle={{backgroundColor: '#111115', borderColor: '#1f1f2e', borderRadius: '8px'}} />
                <Area type="monotone" dataKey="value" stroke="hsl(190 90% 50%)" strokeWidth={2} fillOpacity={1} fill="url(#colorVal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Live Agent Feed */}
        <Card className="flex flex-col h-full overflow-hidden p-0">
          <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Server size={18} className="text-accent" />
              Agent Pipeline
            </h3>
            <span className="flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {activity?.map((agent) => (
              <motion.div 
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                key={agent.agentId} 
                className="flex flex-col gap-2 p-3 rounded-xl bg-black/20 border border-white/5 hover:border-white/10 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <span className="font-mono text-sm font-bold text-accent">{agent.agentName}</span>
                  <Badge variant={
                    agent.status === 'processing' ? 'default' : 
                    agent.status === 'completed' ? 'success' : 
                    agent.status === 'failed' ? 'danger' : 'outline'
                  }>
                    {agent.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground truncate">{agent.currentTask || "Awaiting instructions..."}</p>
              </motion.div>
            ))}
            {(!activity || activity.length === 0) && (
              <div className="text-center text-muted-foreground py-10 font-mono text-sm">Pipeline idle</div>
            )}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-bold text-white mb-6">Task Distribution</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={analytics.tasksByStatus} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {analytics.tasksByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{backgroundColor: '#111115', borderColor: '#1f1f2e'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
        
        <Card>
          <h3 className="text-lg font-bold text-white mb-6">Risk Alerts</h3>
          <div className="space-y-3">
            {analytics.riskAlerts.slice(0, 4).map(alert => (
              <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-white">{alert.type.replace('_', ' ').toUpperCase()}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{alert.message}</p>
                </div>
                <Badge variant="danger" className="ml-auto">{alert.severity}</Badge>
              </div>
            ))}
            {analytics.riskAlerts.length === 0 && (
              <div className="text-emerald-400 font-mono text-sm flex items-center gap-2">
                <CheckCircle2 size={16}/> No active risks detected.
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
