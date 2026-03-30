import { Card, Button } from "@/components/UI";
import { Download, FileText, Share2 } from "lucide-react";

export default function Reports() {
  const reports = [
    { title: "Weekly Executive Summary", type: "PDF", date: "Today, 09:00" },
    { title: "SLA Violation Root Cause", type: "CSV", date: "Yesterday, 14:30" },
    { title: "Agent Efficiency Metrics Q3", type: "PDF", date: "Oct 12, 11:00" },
  ];

  return (
    <div className="max-w-4xl space-y-6">
      <header className="flex justify-between items-center border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Generated Reports</h1>
          <p className="text-muted-foreground mt-1 text-sm font-mono">Export system data matrices.</p>
        </div>
        <Button><FileText size={16} /> Generate New</Button>
      </header>

      <div className="space-y-4">
        {reports.map((r, i) => (
          <Card key={i} className="flex justify-between items-center p-4 hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <FileText size={20} />
              </div>
              <div>
                <h4 className="text-white font-bold">{r.title}</h4>
                <p className="text-xs text-muted-foreground font-mono">{r.type} • Compiled: {r.date}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" className="px-3"><Share2 size={16}/></Button>
              <Button variant="secondary" className="px-3"><Download size={16}/></Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
