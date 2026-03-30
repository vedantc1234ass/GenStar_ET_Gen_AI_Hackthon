import { useState } from "react";
import { useGetMeetings, useCreateMeeting } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, Button, Badge } from "@/components/UI";
import { format } from "date-fns";
import { FileAudio, Wand2, Calendar, Target, User } from "lucide-react";

export default function Meetings() {
  const queryClient = useQueryClient();
  const { data: meetings, isLoading } = useGetMeetings();
  
  const createMut = useCreateMeeting({
    mutation: {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/meetings"] })
    }
  });

  const [form, setForm] = useState({ title: "", transcript: "" });

  const handleAnalyze = () => {
    if(!form.title || !form.transcript) return;
    createMut.mutate({
      data: {
        title: form.title,
        transcript: form.transcript,
        date: new Date().toISOString()
      }
    }, {
      onSuccess: () => setForm({ title: "", transcript: "" })
    });
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
      <div className="xl:col-span-1 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Meeting Intel</h1>
          <p className="text-muted-foreground mt-1 text-sm font-mono">Upload transcripts for structural analysis.</p>
        </div>

        <Card glow className="border-primary/20">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <FileAudio size={18} className="text-primary"/>
            Ingest Transcript
          </h3>
          <input 
            placeholder="Session Title (e.g. Q3 Sync)"
            className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white mb-4 focus:outline-none focus:border-primary font-mono text-sm"
            value={form.title}
            onChange={(e) => setForm({...form, title: e.target.value})}
          />
          <textarea 
            placeholder="Paste raw transcription data here..."
            className="w-full h-64 px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white mb-4 focus:outline-none focus:border-primary font-mono text-xs resize-none"
            value={form.transcript}
            onChange={(e) => setForm({...form, transcript: e.target.value})}
          />
          <Button 
            className="w-full" 
            onClick={handleAnalyze} 
            disabled={createMut.isPending || !form.transcript}
          >
            <Wand2 size={16} />
            {createMut.isPending ? "Processing Tensor..." : "Extract Actionables"}
          </Button>
        </Card>
      </div>

      <div className="xl:col-span-2 space-y-6">
        <h2 className="text-xl font-bold text-white border-b border-white/10 pb-2">Analysis History</h2>
        
        {isLoading ? (
          <div className="animate-pulse text-primary">Accessing archives...</div>
        ) : meetings?.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground border border-dashed border-white/10 rounded-2xl">
            No meeting data processed yet.
          </div>
        ) : (
          meetings?.map(meeting => (
            <Card key={meeting.id} className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-white">{meeting.title}</h3>
                  <div className="flex items-center gap-4 mt-2 text-xs font-mono text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar size={12}/> {format(new Date(meeting.date), 'PP p')}</span>
                    <Badge variant={meeting.status === 'processed' ? 'success' : 'outline'}>{meeting.status}</Badge>
                  </div>
                </div>
                <Button variant="secondary" className="text-xs h-8">View Raw</Button>
              </div>

              {meeting.decisions.length > 0 && (
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                  <h4 className="text-sm font-bold text-primary mb-2 flex items-center gap-2"><Target size={14}/> Key Decisions</h4>
                  <ul className="list-disc pl-5 text-sm text-white/80 space-y-1">
                    {meeting.decisions.map((d, i) => <li key={i}>{d}</li>)}
                  </ul>
                </div>
              )}

              {meeting.extractedTasks.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-white mb-3">Extracted Vectors (Tasks)</h4>
                  <div className="grid gap-2">
                    {meeting.extractedTasks.map((t, i) => (
                      <div key={i} className="flex items-center justify-between bg-black/30 p-3 rounded-lg border border-white/5">
                        <span className="text-sm font-medium text-white">{t.title}</span>
                        <div className="flex gap-3 text-xs">
                          <span className="flex items-center gap-1 text-accent"><User size={12}/> {t.owner}</span>
                          <span className="text-muted-foreground">{t.deadline}</span>
                          <Badge variant={t.priority === 'high' ? 'danger' : 'outline'}>{t.priority}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
