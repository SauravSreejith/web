import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PathTracer = () => {
  const [sourceGene, setSourceGene] = useState('');
  const [targetGene, setTargetGene] = useState('');
  const [pathData, setPathData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleTrace = async () => {
    if (!sourceGene.trim() || !targetGene.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `http://localhost:8000/api/path?source=${sourceGene.trim()}&target=${targetGene.trim()}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch path data');
      }
      const data = await response.json();
      setPathData(data);
    } catch (err) {
      setError(err.message);
      setPathData(null);
    } finally {
      setLoading(false);
    }
  };

  const PathVisualization = ({ path, label, color }) => {
    if (!path || path.error) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/[0.03] border border-white/[0.08] flex items-center justify-center">
              <svg className="w-8 h-8 text-[#A6AEB8]/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-sm text-[#A6AEB8]">{path?.error || 'No path available'}</p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <div className="w-full max-w-2xl">
          {/* Path visualization */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {path.path.map((gene, idx) => (
              <motion.div
                key={idx}
                className="flex items-center gap-2"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: idx * 0.1 }}
              >
                <div
                  className="px-4 py-2 rounded-lg font-mono-data font-bold text-sm"
                  style={{
                    backgroundColor: `${color}15`,
                    border: `2px solid ${color}40`,
                    color: color
                  }}
                >
                  {gene}
                </div>
                {idx < path.path.length - 1 && (
                  <motion.svg
                    className="w-6 h-6"
                    style={{ color }}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.1 + 0.15 }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </motion.svg>
                )}
              </motion.div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <div className="text-xs text-[#A6AEB8] uppercase tracking-wider mb-1">
                Path Length
              </div>
              <div className="font-mono-data text-2xl font-bold text-[#F2F4F8]">
                {path.path.length} nodes
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <div className="text-xs text-[#A6AEB8] uppercase tracking-wider mb-1">
                Path Cost
              </div>
              <div className="font-mono-data text-2xl font-bold" style={{ color }}>
                {path.cost.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col p-6 gap-6">
      {/* Controls Panel */}
      <div className="flex-none">
        <div className="glass-card p-6">
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className="block text-sm text-[#A6AEB8] mb-2">Source Gene</label>
              <input
                type="text"
                value={sourceGene}
                onChange={(e) => setSourceGene(e.target.value.toUpperCase())}
                onKeyPress={(e) => e.key === 'Enter' && handleTrace()}
                placeholder="e.g., EGFR"
                className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08]
                           text-[#F2F4F8] placeholder-[#A6AEB8]/50
                           focus:outline-none focus:border-[#00F0FF]/50 focus:ring-1 focus:ring-[#00F0FF]/30
                           transition-all duration-200"
              />
            </div>

            <svg className="w-6 h-6 text-[#A6AEB8] mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>

            <div className="flex-1">
              <label className="block text-sm text-[#A6AEB8] mb-2">Target Gene</label>
              <input
                type="text"
                value={targetGene}
                onChange={(e) => setTargetGene(e.target.value.toUpperCase())}
                onKeyPress={(e) => e.key === 'Enter' && handleTrace()}
                placeholder="e.g., MYC"
                className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08]
                           text-[#F2F4F8] placeholder-[#A6AEB8]/50
                           focus:outline-none focus:border-[#00F0FF]/50 focus:ring-1 focus:ring-[#00F0FF]/30
                           transition-all duration-200"
              />
            </div>

            <button
              onClick={handleTrace}
              disabled={loading || !sourceGene.trim() || !targetGene.trim()}
              className="px-6 py-3 rounded-xl bg-[#00F0FF]/10 border border-[#00F0FF]/40
                         text-[#00F0FF] font-medium hover:bg-[#00F0FF]/20 hover:border-[#00F0FF]/60
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-all duration-200 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Tracing...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  Trace Signal
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="mt-4 p-3 rounded-lg bg-[#FF2D8D]/10 border border-[#FF2D8D]/30 text-[#FF2D8D] text-sm">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Path Comparison */}
      {pathData && (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
          {/* Normal Tissue Path */}
          <motion.div
            className="glass-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg font-bold text-[#00F0FF]">Normal Tissue</h3>
                <p className="text-xs text-[#A6AEB8]">Signal pathway in healthy cells</p>
              </div>
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#00F0FF', boxShadow: '0 0 12px #00F0FF' }} />
            </div>
            <div className="h-[calc(100%-5rem)]">
              <PathVisualization path={pathData.normal} label="Normal" color="#00F0FF" />
            </div>
          </motion.div>

          {/* Tumor Tissue Path */}
          <motion.div
            className="glass-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg font-bold text-[#FF2D8D]">Tumor Tissue</h3>
                <p className="text-xs text-[#A6AEB8]">Signal pathway in cancer cells</p>
              </div>
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#FF2D8D', boxShadow: '0 0 12px #FF2D8D' }} />
            </div>
            <div className="h-[calc(100%-5rem)]">
              <PathVisualization path={pathData.tumor} label="Tumor" color="#FF2D8D" />
            </div>
          </motion.div>
        </div>
      )}

      {/* Empty State */}
      {!pathData && !loading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/[0.03] border border-white/[0.08] flex items-center justify-center">
              <svg className="w-10 h-10 text-[#A6AEB8]/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-[#F2F4F8] mb-2">Ready to trace signaling paths</h3>
            <p className="text-sm text-[#A6AEB8] max-w-md">
              Enter source and target genes to visualize how signals flow through the network
              and identify rewiring between normal and tumor tissues.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PathTracer;
