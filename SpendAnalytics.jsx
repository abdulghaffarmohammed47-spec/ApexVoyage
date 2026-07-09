/* ═══════════════════════════════════════════════════════════════
   SpendAnalytics — Recharts Visualization (React.memo Wrapped)
   Aggregates booking costs by category with dynamic memoization
   ═══════════════════════════════════════════════════════════════ */

import { useMemo, memo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';

// ─── Color Palette (Defined Outside Render Block) ───
const CHART_COLORS = [
  '#22d3ee', // cyan
  '#a78bfa', // violet
  '#34d399', // emerald
  '#fbbf24', // amber
  '#fb7185', // rose
  '#38bdf8', // sky
  '#f97316', // orange
  '#818cf8', // indigo
];

const TOOLTIP_STYLE = {
  backgroundColor: '#0f172a',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '8px',
  padding: '8px 12px',
  boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
};

const TOOLTIP_LABEL_STYLE = {
  color: '#f1f5f9',
  fontWeight: 600,
  fontSize: '0.85rem',
  marginBottom: '4px',
};

const TOOLTIP_ITEM_STYLE = {
  color: '#94a3b8',
  fontSize: '0.8rem',
};

// ─── Custom Tooltip ───
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div style={TOOLTIP_STYLE}>
      <div style={TOOLTIP_LABEL_STYLE}>{label}</div>
      {payload.map((entry, i) => (
        <div key={i} style={TOOLTIP_ITEM_STYLE}>
          <span style={{ color: entry.color }}>●</span>{' '}
          ${entry.value?.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
        </div>
      ))}
    </div>
  );
}

// ─── Spending by Destination Bar Chart ───
const SpendByDestinationChart = memo(function SpendByDestinationChart({ reservations }) {
  const chartData = useMemo(() => {
    const grouped = {};
    reservations.forEach(r => {
      const dest = r.destination || 'Unknown';
      if (!grouped[dest]) {
        grouped[dest] = { destination: dest, total: 0, count: 0 };
      }
      grouped[dest].total += (typeof r.totalCost === 'number' ? r.totalCost : 0);
      grouped[dest].count += 1;
    });
    return Object.values(grouped).sort((a, b) => b.total - a.total);
  }, [reservations]);

  if (chartData.length === 0) {
    return (
      <div className="empty-state" style={{ padding: '2rem' }}>
        <div className="icon">📊</div>
        <p>No spending data yet</p>
        <p style={{ fontSize: '0.8rem', marginTop: '0.3rem' }}>
          Book your first trip to see analytics
        </p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
        <XAxis
          dataKey="destination"
          tick={{ fill: '#64748b', fontSize: 11 }}
          axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#64748b', fontSize: 11 }}
          axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
          tickLine={false}
          tickFormatter={v => `$${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar
          dataKey="total"
          radius={[6, 6, 0, 0]}
          maxBarSize={50}
        >
          {chartData.map((_, index) => (
            <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
});

// ─── Room Tier Distribution Pie Chart ───
const TierDistributionChart = memo(function TierDistributionChart({ reservations }) {
  const pieData = useMemo(() => {
    const grouped = {};
    reservations.forEach(r => {
      const tier = r.roomTier || 'Standard';
      if (!grouped[tier]) {
        grouped[tier] = { name: tier, value: 0 };
      }
      grouped[tier].value += 1;
    });
    return Object.values(grouped);
  }, [reservations]);

  if (pieData.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={pieData}
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={80}
          paddingAngle={4}
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          labelLine={false}
        >
          {pieData.map((_, index) => (
            <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          formatter={(value) => [`${value} booking(s)`, 'Count']}
        />
        <Legend
          wrapperStyle={{ fontSize: '0.75rem', color: '#94a3b8' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
});

// ─── Main Export: Combined Analytics Widget ───
const SpendAnalytics = memo(function SpendAnalytics({ reservations }) {
  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 className="text-title" style={{ marginBottom: '0.3rem' }}>
          💰 Spending by Destination
        </h3>
        <p className="text-body" style={{ fontSize: '0.8rem' }}>
          Total allocation across your booked trips
        </p>
        <SpendByDestinationChart reservations={reservations} />
      </div>

      {reservations.length > 0 && (
        <div>
          <h3 className="text-title" style={{ marginBottom: '0.3rem' }}>
            🏨 Room Tier Distribution
          </h3>
          <TierDistributionChart reservations={reservations} />
        </div>
      )}
    </div>
  );
});

export default SpendAnalytics;
