import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, BrainCircuit, Activity, Zap, Shield } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden relative">
      {/* Background Image & Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={`${import.meta.env.BASE_URL}images/hero-bg.png`} 
          alt="Abstract Tech" 
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background" />
      </div>

      <div className="relative z-10 container mx-auto px-6 py-12">
        <nav className="flex items-center justify-between mb-24 glass-panel px-6 py-4 rounded-full">
          <div className="flex items-center gap-3">
            <img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="GenStar Logo" className="w-10 h-10 drop-shadow-[0_0_10px_rgba(0,255,255,0.5)]" />
            <span className="font-display font-bold text-2xl tracking-widest text-gradient">GENSTAR</span>
          </div>
          <Link href="/dashboard" className="px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 font-semibold transition-all hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]">
            Launch System
          </Link>
        </nav>

        <main className="flex flex-col items-center text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-mono text-sm mb-8 shadow-[0_0_20px_rgba(0,255,255,0.15)]">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Enterprise AI Workflow Engine v2.0
            </div>
            
            <h1 className="text-5xl md:text-7xl font-display font-bold leading-tight mb-6 text-white drop-shadow-2xl">
              Orchestrate Chaos.<br/>
              <span className="text-gradient">Automate Intelligence.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto font-light leading-relaxed">
              GenStar deploys a synchronized pipeline of specialized AI agents to manage your enterprise workflows, analyze meetings, and hyper-scale productivity.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link href="/dashboard" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-bold text-lg shadow-[0_0_30px_rgba(0,255,255,0.3)] hover:shadow-[0_0_50px_rgba(0,255,255,0.5)] hover:-translate-y-1 transition-all flex items-center justify-center gap-2 group">
                Enter Dashboard
                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-32 w-full"
          >
            {[
              { icon: BrainCircuit, title: "Multi-Agent Pipeline", desc: "8 specialized AI roles working in harmony." },
              { icon: Activity, title: "Real-time Telemetry", desc: "Live monitoring of workflow health & risk." },
              { icon: Zap, title: "Meeting Intelligence", desc: "Auto-extract tasks & decisions from transcripts." }
            ].map((feature, i) => (
              <div key={i} className="glass-panel p-8 text-left group hover:border-primary/30 transition-colors">
                <feature.icon className="w-12 h-12 text-primary mb-6 group-hover:drop-shadow-[0_0_10px_rgba(0,255,255,0.8)] transition-all" />
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-muted-foreground font-light">{feature.desc}</p>
              </div>
            ))}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
