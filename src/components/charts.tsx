'use client';
import { useState } from 'react';
import { monthly, wealth } from '@/data/mock';
import { money, type Period } from '@/lib/service';
export function ProductionChart({ period }: { period: Period }) {
  const [selected, setSelected] = useState(8);
  const start = period === 'Month' ? 8 : period === 'Quarter' ? 6 : 0;
  const data = period === 'YTD' ? monthly : monthly.slice(start, 9);
  const current = monthly[selected];
  return (
    <div className="production-chart">
      <div className="chart-summary">
        <span>
          <i className="legend-dot" />
          2026 <i className="legend-dot pale" />
          2025
        </span>
        <span aria-live="polite">
          {current.month} <strong>{money(current.volume, true)}</strong>
          <span className="muted"> · prior {money(current.prior, true)}</span>
        </span>
      </div>
      <div className="chart-plot">
        <div className="chart-axis">
          <span>$1.5M</span>
          <span>$1M</span>
          <span>$500K</span>
          <span>$0</span>
        </div>
        <div className="bar-area">
          <div className="gridlines">
            <i />
            <i />
            <i />
            <i />
          </div>
          {data.map((m) => {
            const i = monthly.indexOf(m);
            return (
              <button
                key={m.month}
                className={`bar-group ${selected === i ? 'selected' : ''} ${m.projected ? 'future' : ''}`}
                aria-label={`${m.month}: ${m.projected ? 'no closed production yet' : money(m.volume)}; prior year ${money(m.prior)}`}
                onMouseEnter={() => setSelected(i)}
                onFocus={() => setSelected(i)}
                onClick={() => setSelected(i)}
              >
                <span className="bar-pair">
                  <span className="bar prior" style={{ height: `${(m.prior / 1600000) * 100}%` }} />
                  <span
                    className="bar current"
                    style={{ height: `${(m.volume / 1600000) * 100}%` }}
                  />
                </span>
                <span className="month-label">{m.month}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
export function BalanceChart() {
  const [selected, setSelected] = useState(8);
  const data = wealth.history;
  const coords = data.map((p, i) => [i * 90 + 12, 160 - ((p.balance - 47000) / 23000) * 145]);
  const line = coords.map(([x, y], i) => `${i ? 'L' : 'M'}${x},${y}`).join(' ');
  return (
    <div className="balance-chart">
      <div className="chart-summary">
        <span>
          <i className="legend-dot" />
          Balance over time
        </span>
        <span aria-live="polite">
          {data[selected].month} <strong>{money(data[selected].balance)}</strong>
        </span>
      </div>
      <svg
        viewBox="0 0 750 180"
        role="img"
        aria-label="Wealth Builder balance grows from $48,470 in January to $68,420 in September"
      >
        <defs>
          <linearGradient id="balance-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#418FDE" stopOpacity=".22" />
            <stop offset="1" stopColor="#418FDE" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[30, 90, 150].map((y) => (
          <line
            key={y}
            x1="0"
            x2="750"
            y1={y}
            y2={y}
            stroke="var(--glacier)"
            strokeDasharray="4 5"
          />
        ))}
        <path d={`${line} L732,178 L12,178 Z`} fill="url(#balance-fill)" />
        <path d={line} fill="none" stroke="var(--cb-blue)" strokeWidth="3" />
        {coords.map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r={selected === i ? 6 : 3} fill="var(--cb-blue)" />
        ))}
      </svg>
      <div className="balance-months">
        {data.map((m, i) => (
          <button
            key={m.month}
            className={i === selected ? 'active' : ''}
            onMouseEnter={() => setSelected(i)}
            onFocus={() => setSelected(i)}
            onClick={() => setSelected(i)}
            aria-label={`${m.month} balance ${money(m.balance)}`}
          >
            {m.month}
          </button>
        ))}
      </div>
    </div>
  );
}
