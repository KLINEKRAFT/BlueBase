'use client';
import { useState } from 'react';
import { ArrowUpRight, ShieldCheck, Wallet, TrendingUp } from 'lucide-react';
import { wealth, contributions, goals as defaultGoals } from '@/data/mock';
import { money, dateLabel } from '@/lib/service';
import type { Goal } from '@/lib/types';
import { PageHeading, SectionHeading, Modal, useStoredState } from './ui';
import { BalanceChart } from './charts';
export function Wealth() {
  const [filter, setFilter] = useState('All');
  const [info, setInfo] = useState(false);
  const [goals] = useStoredState<Goal[]>('goals', defaultGoals);
  const target = goals.find((g) => g.id === 'wealth')!.target;
  return (
    <>
      <PageHeading
        eyebrow="BUILDING WHAT’S NEXT"
        title="Today’s work. Tomorrow’s freedom."
        description="A little from each closing. A lasting investment in you."
      >
        <button className="btn secondary" onClick={() => setInfo(true)}>
          How it works
          <ArrowUpRight size={16} />
        </button>
      </PageHeading>
      <div className="wealth-layout">
        <section className="panel wealth-balance">
          <span className="eyebrow">YOUR WEALTH BUILDER BALANCE</span>
          <div className="hero-number">{money(wealth.balance)}</div>
          <div className="comparison">
            <span>
              <TrendingUp size={14} />
              Growing with every closing
            </span>
          </div>
          <BalanceChart />
        </section>
        <section className="panel contribution-summary">
          <div className="feature-icon">
            <Wallet size={24} />
          </div>
          <h2>Your future, funded.</h2>
          <p className="muted">Your demo contribution rate is 10% of net commission.</p>
          <div className="summary-line">
            <span>Confirmed this year</span>
            <strong>{money(wealth.confirmed)}</strong>
          </div>
          <div className="summary-line">
            <span>Pending contributions</span>
            <strong>{money(wealth.pending)}</strong>
          </div>
          <div className="summary-line">
            <span>Lifetime contributions</span>
            <strong>{money(wealth.lifetime)}</strong>
          </div>
          <div className="goal">
            <div className="goal-name">
              <span>Annual contribution goal</span>
              <strong>{Math.round((wealth.ytd / target) * 100)}%</strong>
            </div>
            <div className="progress">
              <i style={{ width: `${Math.min(100, (wealth.ytd / target) * 100)}%` }} />
            </div>
            <p>
              {money(wealth.ytd)} of {money(target)}
            </p>
          </div>
          <div className="info-note">
            <ShieldCheck size={19} />
            <span>Fictional program data for this demo. No funds are moved.</span>
          </div>
        </section>
      </div>
      <section className="panel">
        <SectionHeading
          title="Small steps. Lasting progress."
          description="Your contribution history."
          action={
            <select
              aria-label="Contribution status"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option>All</option>
              <option>Confirmed</option>
              <option>Pending</option>
            </select>
          }
        />
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Property / closing date</th>
                <th>Net commission</th>
                <th>Rate</th>
                <th>Contribution</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {contributions
                .filter((c) => filter === 'All' || c.status === filter)
                .map((c) => (
                  <tr key={c.id}>
                    <td>
                      <strong>{c.property}</strong>
                      <small>{dateLabel(c.date)}</small>
                    </td>
                    <td data-label="Net commission">{money(c.netCommission)}</td>
                    <td data-label="Contribution rate">{c.percent}%</td>
                    <td data-label="Contribution">
                      <strong>{money(c.amount)}</strong>
                    </td>
                    <td>
                      <span className={`status ${c.status === 'Confirmed' ? 'green' : 'amber'}`}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>
      {info && (
        <Modal title="Build a little with every closing." onClose={() => setInfo(false)}>
          <div className="prose">
            <p>
              This fictional Wealth Builder example allocates 10% of each closing’s net commission
              to a long-term account.
            </p>
            <p>
              Confirmed contributions come from closed transactions. Pending contributions are
              estimates from your pipeline and have not been added to your balance.
            </p>
            <p>
              The illustrated balance includes a $47,420 opening balance and $21,000 in 2026
              contributions. Lifetime contributions include $41,100 from prior years; the $6,320
              difference is illustrative historical growth.
            </p>
            <p>
              Actual program eligibility, contribution rules, investment performance, and tax
              treatment will need to be defined before launch. No investment or payment connection
              exists in this demo.
            </p>
          </div>
        </Modal>
      )}
    </>
  );
}
