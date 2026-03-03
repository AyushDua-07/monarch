import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import Dashboard from './Dashboard';
import { Loader2 } from 'lucide-react';
import { getRankBadge } from '@/lib/assets';

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050510]">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-2 border-cyan-500/30 rounded-full animate-spin border-t-cyan-400 mx-auto" />
          </div>
          <p className="text-xs text-gray-500 font-mono tracking-widest uppercase">Initializing System...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050510] px-4">
        <div className="w-full max-w-sm space-y-8 text-center">
          {/* Logo / Rank Badge */}
          <div className="space-y-3">
            <img src={getRankBadge('E')} alt="Rank" className="w-20 h-20 mx-auto opacity-80" />
            <h1 className="font-heading text-3xl font-bold text-white tracking-wider">LEVELING</h1>
            <p className="text-xs text-gray-500 font-mono tracking-widest uppercase">Solo Leveling Inspired Life System</p>
          </div>

          {/* System Window */}
          <div className="system-card p-6 space-y-4">
            <div className="text-left space-y-2">
              <p className="text-[10px] text-cyan-400 font-mono uppercase tracking-widest">// System Notice</p>
              <p className="text-sm text-gray-300 leading-relaxed">
                Hunter identification required. Sign in to access your status window and begin your journey.
              </p>
            </div>

            <a
              href={getLoginUrl()}
              className="block w-full py-3.5 bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 font-heading text-sm tracking-wider uppercase text-center hover:bg-cyan-500/30 transition-all rounded-sm"
            >
              ⚔️ Enter the System
            </a>

            <p className="text-[10px] text-gray-600 font-mono">
              Sign in with your email to continue
            </p>
          </div>

          <p className="text-[10px] text-gray-700 font-mono">v3.0 — The Abyss Interface</p>
        </div>
      </div>
    );
  }

  return <Dashboard />;
}
