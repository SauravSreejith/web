import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

const VirtualKnockout = () => {
  const [knockoutData, setKnockoutData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchKnockoutData();
  }, []);

  const fetchKnockoutData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8000/api/knockout');
      if (!response.ok) {
        throw new Error('Failed to fetch knockout data');
      }
      const data = await response.json();
      setKnockoutData(data);
    } catch (err) {
      setError(err.message);
      setKnockoutData([]);
    } finally {
      setLoading(false);
    }
  };

  const getBarColor = (vitality) => {
    if (vitality > 20) return '#FF2D8D';
    if (vitality > 10) return '#FFD166';
    return '#00F0FF';
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="glass-card-sm p-4 border border-[#00F0FF]/30">
          <p className="font-mono-data font-bold text-[#F2F4F8] mb-2">{data.gene}</p>
          <div className="space-y-1 text-xs">
            <p className="text-[#A6AEB8]">
              Vitality Score: <span className="text-[#00F0FF] font-bold">{data.vitality_score.toFixed(2)}</span>
            </p>
            <p className="text-[#A6AEB8]">
              ASPL Change: <span className="text-[#FFD166]">{data.aspl_change.toFixed(2)}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const topData = knockoutData.slice(0, 15);

  return (
    <div className="h-full flex flex-col p-6 gap-6">
      {/* Header */}
      <div className="flex-none">
        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold text-[#F2F4F8] mb-1">
                Virtual Knockout Analysis
              </h2>
              <p className="text-sm text-[#A6AEB8]">
                Identifies hub genes critical for network integrity. Higher vitality scores indicate essential nodes.
              </p>
            </div>

            <button
              onClick={fetchKnockoutData}
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/10
                         text-[#A6AEB8] hover:text-[#00F0FF] hover:border-[#00F0FF]/30
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-all duration-200 flex items-center gap-2"
            >
              <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>

          {error && (
            <div className="mt-4 p-3 rounded-lg bg-[#FF2D8D]/10 border border-[#FF2D8D]/30 text-[#FF2D8D] text-sm">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <svg className="w-12 h-12 mx-auto mb-4 animate-spin text-[#00F0FF]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-sm text-[#A6AEB8]">Loading knockout analysis...</p>
          </div>
        </div>
      ) : knockoutData.length > 0 ? (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
          {/* Bar Chart */}
          <motion.div
            className="glass-card p-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h3 className="font-display text-lg font-bold text-[#F2F4F8] mb-4">
              Top 15 Critical Hub Genes
            </h3>
            <div className="h-[calc(100%-3rem)]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.06)" />
                  <XAxis
                    type="number"
                    tick={{ fill: '#A6AEB8', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                    tickLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
                    axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
                  />
                  <YAxis
                    type="category"
                    dataKey="gene"
                    tick={{ fill: '#A6AEB8', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                    tickLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
                    axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 240, 255, 0.1)' }} />
                  <Bar dataKey="vitality_score" radius={[0, 8, 8, 0]}>
                    {topData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getBarColor(entry.vitality_score)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Data Table */}
          <motion.div
            className="glass-card flex flex-col"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className="flex-none p-6 border-b border-white/10">
              <h3 className="font-display text-lg font-bold text-[#F2F4F8]">
                Detailed Rankings
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto">
              <table className="w-full">
                <thead className="sticky top-0 bg-[#0A0A0A] z-10">
                  <tr className="border-b border-white/10">
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#A6AEB8] uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#A6AEB8] uppercase tracking-wider">
                      Gene
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-[#A6AEB8] uppercase tracking-wider">
                      Vitality Score
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-[#A6AEB8] uppercase tracking-wider">
                      ASPL Change
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {knockoutData.map((gene, index) => (
                    <motion.tr
                      key={gene.gene}
                      className="hover:bg-white/[0.03] transition-colors"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.02 }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${
                            index < 3
                              ? 'bg-[#FF2D8D]/20 text-[#FF2D8D] border border-[#FF2D8D]/40'
                              : 'bg-white/5 text-[#A6AEB8]'
                          }`}
                        >
                          {index + 1}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono-data font-bold text-[#F2F4F8]">
                          {gene.gene}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span
                          className="font-mono-data text-sm font-bold"
                          style={{ color: getBarColor(gene.vitality_score) }}
                        >
                          {gene.vitality_score.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="font-mono-data text-sm text-[#A6AEB8]">
                          {gene.aspl_change.toFixed(2)}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/[0.03] border border-white/[0.08] flex items-center justify-center">
              <svg className="w-10 h-10 text-[#A6AEB8]/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-[#F2F4F8] mb-2">No knockout data available</h3>
            <p className="text-sm text-[#A6AEB8]">Click refresh to load the analysis</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VirtualKnockout;
