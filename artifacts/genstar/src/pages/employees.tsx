import { useState } from "react";
import { useEmployeesData, useAddEmployee, useRemoveEmployee } from "@/hooks/use-employees";
import { Card, Badge, Button, Input } from "@/components/UI";
import { UserPlus, Activity, Trash2 } from "lucide-react";

export default function Employees() {
  const { data: employees, isLoading } = useEmployeesData();
  const addMut = useAddEmployee();
  const delMut = useRemoveEmployee();

  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: "", department: "" });

  const handleAdd = () => {
    if(!form.name || !form.email) return;
    addMut.mutate({ data: form }, { onSuccess: () => setIsAdding(false) });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Personnel Telemetry</h1>
          <p className="text-muted-foreground mt-1 text-sm font-mono">Monitor performance vectors across all biological units.</p>
        </div>
        <Button onClick={() => setIsAdding(!isAdding)} variant={isAdding ? "secondary" : "primary"}>
          {isAdding ? "Close Modal" : <><UserPlus size={16}/> Provision Unit</>}
        </Button>
      </div>

      {/* Formula Display */}
      <div className="bg-gradient-to-r from-primary/10 to-transparent border border-primary/20 rounded-xl p-4 flex items-center gap-4">
        <Activity className="text-primary animate-pulse" />
        <div className="font-mono text-sm">
          <span className="text-muted-foreground">Productivity Algorithm: </span>
          <span className="text-white font-bold">(Tasks_Completed × Quality_Score) / Time_Expended</span>
        </div>
      </div>

      {isAdding && (
        <Card glow className="border-accent/30 max-w-2xl">
          <h3 className="font-bold text-white mb-4">Provision New Biological Unit</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Input placeholder="Full Name" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} />
            <Input placeholder="Email Designation" type="email" value={form.email} onChange={e=>setForm({...form, email: e.target.value})} />
            <Input placeholder="Role" value={form.role} onChange={e=>setForm({...form, role: e.target.value})} />
            <Input placeholder="Department" value={form.department} onChange={e=>setForm({...form, department: e.target.value})} />
          </div>
          <Button onClick={handleAdd} disabled={addMut.isPending}>Execute Provisioning</Button>
        </Card>
      )}

      {isLoading ? (
        <div className="animate-pulse text-primary font-mono">Scanning registry...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {employees?.map(emp => (
            <Card key={emp.id} className="relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4">
                <Badge variant={emp.status === 'active' ? 'success' : 'outline'}>{emp.status}</Badge>
              </div>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-secondary border border-white/10 flex items-center justify-center font-bold text-lg text-white">
                  {emp.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">{emp.name}</h3>
                  <p className="text-xs text-muted-foreground font-mono">{emp.role} • {emp.department}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-black/20 p-4 rounded-xl border border-white/5 mb-4">
                <div>
                  <div className="text-xs text-muted-foreground font-mono mb-1">PROD. SCORE</div>
                  <div className="text-2xl font-bold text-accent">{emp.productivityScore.toFixed(1)}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground font-mono mb-1">TASKS DONE</div>
                  <div className="text-2xl font-bold text-white">{emp.tasksCompleted}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground font-mono mb-1">ERROR RATE</div>
                  <div className={`text-lg font-bold ${emp.errorRate > 5 ? 'text-destructive' : 'text-emerald-400'}`}>
                    {emp.errorRate.toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground font-mono mb-1">QUALITY</div>
                  <div className="text-lg font-bold text-white">{emp.qualityScore.toFixed(0)}</div>
                </div>
              </div>

              <div className="flex justify-between items-center mt-4">
                <span className="text-xs text-muted-foreground font-mono">ID: #{emp.id.toString().padStart(4, '0')}</span>
                <button 
                  onClick={() => delMut.mutate({id: emp.id})}
                  className="text-destructive hover:text-white transition-colors p-2 hover:bg-destructive/20 rounded-lg"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
