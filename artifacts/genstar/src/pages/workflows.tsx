import { useState } from "react";
import { useWorkflowsData, useAddWorkflow, useTriggerWorkflow } from "@/hooks/use-workflows";
import { Card, Badge, Button, Input } from "@/components/UI";
import { format } from "date-fns";
import { Play, Plus, GitMerge, AlertCircle } from "lucide-react";
import type { CreateWorkflowRequest } from "@workspace/api-client-react";

export default function Workflows() {
  const { data: workflows, isLoading } = useWorkflowsData();
  const triggerMut = useTriggerWorkflow();
  const createMut = useAddWorkflow();
  
  const [isCreating, setIsCreating] = useState(false);
  const [newWf, setNewWf] = useState<CreateWorkflowRequest>({
    name: "", description: "", priority: "medium"
  });

  const handleCreate = () => {
    if(!newWf.name) return;
    createMut.mutate({ data: newWf }, {
      onSuccess: () => setIsCreating(false)
    });
  };

  if (isLoading) return <div className="animate-pulse text-primary p-8">Loading Digital Twins...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white">Workflow Matrices</h1>
          <p className="text-muted-foreground mt-1 text-sm font-mono">Manage and execute AI-driven pipelines.</p>
        </div>
        <Button onClick={() => setIsCreating(!isCreating)} variant={isCreating ? "secondary" : "primary"}>
          {isCreating ? "Cancel" : <><Plus size={16}/> New Matrix</>}
        </Button>
      </div>

      {isCreating && (
        <Card glow className="border-primary/30">
          <h3 className="text-lg font-bold mb-4">Initialize New Matrix</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Input 
              placeholder="Designation Name" 
              value={newWf.name} 
              onChange={e => setNewWf({...newWf, name: e.target.value})} 
            />
            <Input 
              placeholder="Objective Description" 
              value={newWf.description} 
              onChange={e => setNewWf({...newWf, description: e.target.value})} 
            />
            <select 
              className="px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white outline-none focus:border-primary font-mono text-sm"
              value={newWf.priority}
              onChange={e => setNewWf({...newWf, priority: e.target.value as any})}
            >
              <option value="low">Priority: Low</option>
              <option value="medium">Priority: Medium</option>
              <option value="high">Priority: High</option>
              <option value="critical">Priority: Critical</option>
            </select>
          </div>
          <Button onClick={handleCreate} disabled={createMut.isPending}>
            {createMut.isPending ? "Constructing..." : "Deploy Matrix"}
          </Button>
        </Card>
      )}

      <div className="grid gap-4">
        {workflows?.map(wf => (
          <Card key={wf.id} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-white/[0.02] transition-colors">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <GitMerge className="text-primary" size={20} />
                <h3 className="text-xl font-bold text-white">{wf.name}</h3>
                <Badge variant={
                  wf.status === 'running' ? 'default' : 
                  wf.status === 'completed' ? 'success' : 
                  wf.status === 'failed' ? 'danger' : 'outline'
                }>{wf.status.toUpperCase()}</Badge>
                {wf.priority === 'critical' && <Badge variant="danger" className="animate-pulse"><AlertCircle size={10} className="mr-1 inline"/> CRITICAL</Badge>}
              </div>
              <p className="text-muted-foreground text-sm max-w-2xl">{wf.description}</p>
              
              <div className="flex gap-4 mt-4 text-xs font-mono text-white/50">
                <span>TASKS: {wf.completedTasks}/{wf.taskCount}</span>
                <span>RISK SCORE: {wf.riskScore.toFixed(2)}</span>
                <span>CREATED: {format(new Date(wf.createdAt), 'MMM dd, HH:mm')}</span>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-3">
              <Button variant="secondary" className="font-mono text-xs">Edit Config</Button>
              <Button 
                onClick={() => triggerMut.mutate({ id: wf.id })}
                disabled={triggerMut.isPending || wf.status === 'running'}
                className="font-mono text-xs"
              >
                <Play size={14} /> 
                {triggerMut.isPending ? "INITIATING..." : "EXECUTE"}
              </Button>
            </div>
          </Card>
        ))}
        {workflows?.length === 0 && (
          <div className="text-center py-20 text-muted-foreground border border-dashed border-white/10 rounded-2xl">
            No active matrices found.
          </div>
        )}
      </div>
    </div>
  );
}
