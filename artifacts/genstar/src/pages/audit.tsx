import { useGetAuditLogs } from "@workspace/api-client-react";
import { Card, Badge } from "@/components/UI";
import { format } from "date-fns";
import { Terminal } from "lucide-react";

export default function AuditLogs() {
  const { data: logs, isLoading } = useGetAuditLogs({ query: { refetchInterval: 10000 } });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Terminal className="text-accent" />
          Audit Console
        </h1>
        <p className="text-muted-foreground mt-1 text-sm font-mono">Immutable record of system state changes.</p>
      </header>

      <Card className="overflow-hidden p-0 border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono text-sm">
            <thead>
              <tr className="bg-black/40 border-b border-white/10 text-muted-foreground">
                <th className="p-4 font-semibold">TIMESTAMP</th>
                <th className="p-4 font-semibold">AGENT/ACTOR</th>
                <th className="p-4 font-semibold">ACTION</th>
                <th className="p-4 font-semibold">TARGET</th>
                <th className="p-4 font-semibold">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr><td colSpan={5} className="p-8 text-center text-primary animate-pulse">Fetching logs...</td></tr>
              ) : logs?.map((log) => (
                <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 text-white/60">{format(new Date(log.createdAt), 'yy/MM/dd HH:mm:ss')}</td>
                  <td className="p-4 text-accent font-bold">{log.agentType.toUpperCase()}</td>
                  <td className="p-4 text-white">{log.action}</td>
                  <td className="p-4 text-white/80">{log.entityType} #{log.entityId}</td>
                  <td className="p-4">
                    <Badge variant={log.status === 'success' ? 'success' : log.status === 'failure' ? 'danger' : 'warning'}>
                      {log.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
