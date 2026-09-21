'use client';
import { useState } from 'react';
import {
  ArrowUpRight,
  ArrowUp,
  Target,
  Trophy,
  Sparkles,
  TrendingUp,
  LockKeyhole,
  SlidersHorizontal,
  ChevronRight,
  Wallet,
  MapPin,
  Download,
} from 'lucide-react';
import {
  agent,
  goals as defaultGoals,
  achievements,
  transactions,
  wealth,
  events,
  SNAPSHOT,
} from '@/data/mock';
import type { Goal, AgentProfile, Achievement, Event } from '@/lib/types';
import { money, production, dateLabel, type Period } from '@/lib/service';
import { Modal, PageHeading, SectionHeading, ArrowLink, useStoredState } from './ui';
import { ProductionChart } from './charts';
export function EventRow({ event, onClick }: { event: Event; onClick: () => void }) {
  return (
    <button className="event-row" onClick={onClick}>
      <div className={`date-tile ${event.type === 'Broker open' ? 'navy' : ''}`}>
        <span>{dateLabel(event.date, { month: 'short' })}</span>
        <strong>{dateLabel(event.date, { day: 'numeric' })}</strong>
      </div>
      <div className="event-row-content">
        <span className="eyebrow small">{event.type}</span>
        <h3>{event.title}</h3>
        <p>{event.time}</p>
      </div>
      <ChevronRight size={16} />
    </button>
  );
}
export function Production({
  navigate,
  openEvent,
}: {
  navigate: (path: string) => void;
  openEvent: (e: Event) => void;
}) {
  const [period, setPeriod] = useStoredState<Period>('period', 'YTD');
  const [goals, setGoals] = useStoredState<Goal[]>('goals', defaultGoals);
  const [profile] = useStoredState<AgentProfile>('profile', agent);
  const [editing, setEditing] = useState(false);
  const [allActivity, setAllActivity] = useState(false);
  const [award, setAward] = useState<Achievement | null>(null);
  const [showAwards, setShowAwards] = useState(false);
  const [saved, setSaved] = useState(false);
  const data = production(period),
    ytd = production('YTD');
  const gain = (data.volume / data.priorVolume - 1) * 100;
  const current: Record<Goal['id'], number> = {
    volume: ytd.volume,
    units: ytd.units,
    gci: ytd.gci,
    wealth: wealth.ytd,
  };
  return (
    <>
      <PageHeading
        eyebrow="YOUR PERSONAL WORKSPACE"
        title={`Good morning, ${profile.name.split(' ')[0]}.`}
        description="Here’s how your business is tracking."
      >
        <a
          className="btn secondary export"
          aria-label="Export report"
          href="/api/production-export"
          download
        >
          <Download size={16} />
          Export report
        </a>
      </PageHeading>
      <div className="identity-row">
        <img src={profile.avatar} alt="Demo agent portrait" />
        <strong>{profile.name}</strong>
        <span className="identity-divider" />
        <span>{profile.company}</span>
        <span className="office">
          <MapPin size={13} />
          {profile.office}
        </span>
        <span className="recognition-pill">
          <Sparkles size={13} />
          $5M CLUB
        </span>
        <span className="snapshot">2026 production</span>
      </div>
      <div className="dashboard-grid">
        <div className="dashboard-main">
          <section className="panel production-panel">
            <div className="section-heading">
              <div className="eyebrow">YOUR PRODUCTION</div>
              <div className="segments" aria-label="Production period">
                {(['YTD', 'Quarter', 'Month'] as Period[]).map((p) => (
                  <button
                    key={p}
                    className={p === period ? 'active' : ''}
                    aria-pressed={p === period}
                    onClick={() => setPeriod(p)}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div className="production-top">
              <div>
                <div className="muted">
                  {period === 'YTD'
                    ? 'Year-to-date'
                    : period === 'Quarter'
                      ? 'Third quarter'
                      : 'September'}{' '}
                  sales volume
                </div>
                <div className="hero-number">
                  {money(data.volume, true).replace('M', '')}
                  <span>M</span>
                </div>
                <div className="comparison">
                  <span>
                    <ArrowUp size={13} />
                    {gain.toFixed(1)}%
                  </span>{' '}
                  vs. the same period last year
                </div>
              </div>
              <div className="production-note">
                <TrendingUp size={24} />
                <p>
                  A little momentum.
                  <br />
                  <strong>A lot of possibility.</strong>
                </p>
              </div>
            </div>
            <div className="main-metrics">
              <div>
                <span>Closed units</span>
                <strong>
                  {data.units}
                  <small> sides</small>
                </strong>
              </div>
              <div>
                <span>Gross commission</span>
                <strong>{money(data.gci, true)}</strong>
              </div>
              <div>
                <span>Average sale price</span>
                <strong>{money(data.average, true)}</strong>
              </div>
            </div>
            <ProductionChart period={period} />
            <div className="pipeline-strip">
              <span>
                <i />
                In your pipeline
              </span>
              <strong>{money(data.pendingVolume, true)}</strong>
              <span>{data.pendingUnits} pending sides</span>
              <ArrowUpRight size={17} />
            </div>
          </section>
          <section className="panel goals-panel" id="goals">
            <SectionHeading
              title="Big plans. Real progress."
              description="Your annual goals, one closing closer."
              action={
                <button className="text-link" onClick={() => setEditing(true)}>
                  <SlidersHorizontal size={15} />
                  Edit goals
                </button>
              }
            />
            <div className="goals-grid">
              {goals.slice(0, 3).map((g) => {
                const percent = (current[g.id] / g.target) * 100;
                return (
                  <div className="goal" key={g.id}>
                    <div className="goal-name">
                      <span>{g.label}</span>
                      <span>{Math.round(percent)}%</span>
                    </div>
                    <div className="goal-values">
                      <strong>
                        {g.unit === 'currency' ? money(current[g.id], true) : current[g.id]}
                      </strong>
                      <span> / {g.unit === 'currency' ? money(g.target, true) : g.target}</span>
                    </div>
                    <div
                      className="progress"
                      role="progressbar"
                      aria-label={g.label}
                      aria-valuenow={Math.round(percent)}
                      aria-valuemin={0}
                      aria-valuemax={Math.max(100, Math.round(percent))}
                    >
                      <i style={{ width: `${Math.min(100, percent)}%` }} />
                    </div>
                    <p>
                      {g.unit === 'currency'
                        ? money(Math.max(0, g.target - current[g.id]), true)
                        : Math.max(0, g.target - current[g.id])}{' '}
                      to go
                    </p>
                  </div>
                );
              })}
            </div>
            <div className="pace-note">
              <TrendingUp size={16} />
              <span>
                At your current pace, you’re on track for{' '}
                <strong>{money((ytd.volume / SNAPSHOT.elapsedMonths) * 12, true)}</strong> this
                year.
              </span>
              <span className="muted">Through September</span>
            </div>
            {saved && (
              <p role="status" className="success-text">
                Your goals are saved on this device.
              </p>
            )}
          </section>
          <section className="panel activity-panel">
            <SectionHeading
              title="Every move matters."
              description="The latest in your business."
              action={
                <ArrowLink onClick={() => setAllActivity(!allActivity)}>
                  {allActivity ? 'Show less' : 'View all activity'}
                </ArrowLink>
              }
            />
            <div className="transaction-list">
              {transactions.slice(0, allActivity ? transactions.length : 4).map((t) => (
                <div className="transaction-row" key={t.id}>
                  <img src={t.image} alt="Illustrative property" />
                  <div>
                    <h3>{t.address}</h3>
                    <p>
                      {t.city} <span>· {t.side} side</span>
                      <span className="mobile-status"> · {t.status}</span>
                    </p>
                  </div>
                  <span
                    className={`status ${t.status === 'Closed' ? 'green' : t.status === 'Pending' ? 'amber' : 'blue'}`}
                  >
                    {t.status}
                  </span>
                  <div className="transaction-amount">
                    <strong>{money(t.price)}</strong>
                    <span>{dateLabel(t.date)}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="side-breakdown">
              <span>{data.listings} listings taken</span>
              <span>{data.buyerSides} buyer sides</span>
              <span>{data.listingSides} listing sides</span>
            </div>
          </section>
        </div>
        <aside className="dashboard-aside">
          <button className="wealth-preview" onClick={() => navigate('/wealth')}>
            <div className="wealth-card-top">
              <span className="eyebrow">WEALTH BUILDER</span>
              <ArrowUpRight size={20} />
            </div>
            <div className="wealth-orbit">
              <Wallet size={21} />
            </div>
            <p>Your future is growing.</p>
            <strong>{money(wealth.balance)}</strong>
            <div className="mini-sparkline">
              <svg viewBox="0 0 260 55" aria-hidden="true">
                <path
                  d="M0 52 L23 44 L46 47 L69 33 L92 37 L115 29 L138 31 L161 17 L184 23 L207 11 L230 13 L260 1"
                  fill="none"
                  stroke="#a9c8ed"
                  strokeWidth="2"
                />
              </svg>
            </div>
            <div className="wealth-card-bottom">
              <span>
                <i />+{money(wealth.ytd, true)} contributed this year
              </span>
              <ChevronRight size={15} />
            </div>
          </button>
          <section className="panel upcoming-panel">
            <SectionHeading
              title="On your calendar"
              action={<ArrowLink onClick={() => navigate('/events')}>View all</ArrowLink>}
            />
            <div className="eyebrow small">UPCOMING · YOUR COMMUNITY</div>
            {events.slice(0, 3).map((e) => (
              <EventRow key={e.id} event={e} onClick={() => openEvent(e)} />
            ))}
            <div className="upcoming-footer">
              <span className="tiny-dot" />A little connection goes a long way.
            </div>
          </section>
          <section className="panel achievements-panel">
            <SectionHeading
              title="Well earned."
              action={
                <button
                  className="icon-btn"
                  aria-label="View all achievements"
                  onClick={() => setShowAwards(true)}
                >
                  <ArrowUpRight size={18} />
                </button>
              }
            />
            <p className="muted">Milestones worth a moment.</p>
            <div className="achievement-grid">
              {achievements.slice(0, 4).map((a) => (
                <button
                  className={`achievement ${a.tier} ${!a.unlocked ? 'locked' : ''}`}
                  key={a.id}
                  onClick={() => setAward(a)}
                >
                  <span className="award-icon">
                    {a.unlocked ? <Trophy size={21} /> : <LockKeyhole size={20} />}
                  </span>
                  <strong>{a.title}</strong>
                  <span>{a.unlocked ? a.date : 'Up next'}</span>
                </button>
              ))}
            </div>
          </section>
          <div className="quiet-message">
            <Target size={19} />
            <p>
              Your business. Your ambitions.
              <br />
              <strong>One place to bring them together.</strong>
            </p>
          </div>
        </aside>
      </div>
      {editing && (
        <Modal title="Make room for your next milestone." onClose={() => setEditing(false)}>
          <p className="muted">Set your 2026 goals. You can adjust them as your year unfolds.</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const next = goals.map((g) => ({ ...g, target: Number(fd.get(g.id)) }));
              if (next.some((g) => !Number.isFinite(g.target) || g.target <= 0)) return;
              setGoals(next);
              setEditing(false);
              setSaved(true);
            }}
          >
            <div className="form-grid">
              {goals.map((g) => (
                <label key={g.id}>
                  {g.label}
                  {g.unit === 'currency' ? ' ($)' : ''}
                  <input
                    name={g.id}
                    type="number"
                    min="1"
                    max="1000000000"
                    step="1"
                    required
                    defaultValue={g.target}
                  />
                </label>
              ))}
            </div>
            <div className="modal-actions">
              <button className="btn secondary" type="button" onClick={() => setEditing(false)}>
                Cancel
              </button>
              <button className="btn primary">Save goals</button>
            </div>
          </form>
        </Modal>
      )}
      {award && (
        <Modal title={award.title} onClose={() => setAward(null)}>
          <div className={`award-detail ${award.tier}`}>
            <Trophy size={54} />
            <h3>
              {award.unlocked ? 'A moment worth celebrating.' : 'Your next milestone is in sight.'}
            </h3>
            <p>{award.description}</p>
            <span>{award.date}</span>
          </div>
        </Modal>
      )}
      {showAwards && (
        <Modal title="Your milestones" onClose={() => setShowAwards(false)}>
          <div className="all-awards">
            {achievements.map((a) => (
              <div key={a.id}>
                <Trophy size={22} />
                <div>
                  <h3>
                    {a.title}
                    {!a.unlocked ? ' · Up next' : ''}
                  </h3>
                  <p>{a.description}</p>
                  <small>{a.date}</small>
                </div>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </>
  );
}
