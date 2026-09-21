'use client';
import { useState } from 'react';
import {
  CalendarDays,
  MapPin,
  ArrowUpRight,
  Clock,
  Users,
  Check,
  Route,
  Building2,
  List,
  ChevronRight,
} from 'lucide-react';
import { events, brokerOpens } from '@/data/mock';
import type { Event } from '@/lib/types';
import { dateLabel, money } from '@/lib/service';
import { Empty, PageHeading, Modal, useStoredState } from './ui';
export function Events({ onOpen }: { onOpen: (event: Event) => void }) {
  const [type, setType] = useState('All events');
  const [area, setArea] = useState('All areas');
  const [view, setView] = useState('List');
  const [rsvps] = useStoredState<string[]>('rsvps', []);
  const results = events.filter(
    (e) => (type === 'All events' || e.type === type) && (area === 'All areas' || e.area === area),
  );
  return (
    <>
      <PageHeading
        eyebrow="BETTER, TOGETHER"
        title="Make room for what’s next."
        description="New ideas, familiar faces, and a few doors worth opening."
      />
      <button className="event-hero" onClick={() => onOpen(brokerOpens[0])}>
        <img src={brokerOpens[0].image} alt="Illustrative Midtown home" />
        <div className="event-hero-overlay" />
        <div className="event-hero-content">
          <span className="eyebrow">BROKER OPEN · SEPTEMBER 22</span>
          <h2>
            The Midtown
            <br />
            collection.
          </h2>
          <p>Six distinctive homes. One inspiring afternoon.</p>
          <span className="hero-event-link">
            Explore the route
            <ArrowUpRight size={19} />
          </span>
        </div>
        <span className="hero-listing-count">
          <Building2 size={18} />6 homes · 3 neighborhoods
        </span>
      </button>
      <div className="filter-toolbar">
        <div className="category-scroll event-categories">
          {[
            'All events',
            'Broker open',
            'Training',
            'CE class',
            'Office event',
            'Company event',
          ].map((t) => (
            <button
              key={t}
              className={type === t ? 'active' : ''}
              aria-pressed={type === t}
              onClick={() => setType(t)}
            >
              {t}
            </button>
          ))}
        </div>
        <select value={area} onChange={(e) => setArea(e.target.value)} aria-label="Event area">
          <option>All areas</option>
          <option>Tulsa metro</option>
          <option>Wichita metro</option>
        </select>
        <div className="segments">
          <button
            aria-label="List view"
            aria-pressed={view === 'List'}
            className={view === 'List' ? 'active' : ''}
            onClick={() => setView('List')}
          >
            <List size={17} />
          </button>
          <button
            aria-label="Calendar view"
            aria-pressed={view === 'Calendar'}
            className={view === 'Calendar' ? 'active' : ''}
            onClick={() => setView('Calendar')}
          >
            <CalendarDays size={17} />
          </button>
        </div>
      </div>
      <div className="section-heading">
        <h2>Something to look forward to.</h2>
        <span className="muted">{results.length} upcoming events</span>
      </div>
      {view === 'List' ? (
        <div className="events-list">
          {results.map((e) => (
            <button className="event-card" key={e.id} onClick={() => onOpen(e)}>
              <div className={`date-tile ${e.type === 'Broker open' ? 'navy' : ''}`}>
                <span>{dateLabel(e.date, { month: 'short' })}</span>
                <strong>{dateLabel(e.date, { day: 'numeric' })}</strong>
                <small>{dateLabel(e.date, { weekday: 'short' })}</small>
              </div>
              <div className="event-card-main">
                <div className="event-label-row">
                  <span className={`status ${e.type === 'Broker open' ? 'blue' : 'neutral'}`}>
                    {e.type}
                  </span>
                  {rsvps.includes(e.id) && (
                    <span className="rsvp-confirmed">
                      <Check size={13} />
                      You’re going
                    </span>
                  )}
                </div>
                <h3>{e.title}</h3>
                <p>{e.description}</p>
                <div className="event-card-meta">
                  <span>
                    <Clock size={14} />
                    {e.time}
                  </span>
                  <span>
                    <MapPin size={14} />
                    {e.location}
                  </span>
                </div>
              </div>
              {e.type === 'Broker open' ? (
                <img src={e.image} alt="Illustrative participating property" />
              ) : (
                <div className="event-type-icon">
                  <Users size={26} />
                </div>
              )}
              <ChevronRight size={19} />
            </button>
          ))}
        </div>
      ) : (
        <div className="calendar-months">
          {[9, 10].map((month) => (
            <section className="panel" key={month}>
              <h2>{month === 9 ? 'September' : 'October'} 2026</h2>
              <div className="calendar-grid">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                  <div className="calendar-weekday" key={d}>
                    {d}
                  </div>
                ))}
                {Array.from({ length: new Date(2026, month - 1, 1).getDay() }, (_, i) => (
                  <div key={`empty-${i}`} className="calendar-empty" />
                ))}
                {Array.from({ length: month === 9 ? 30 : 31 }, (_, i) => {
                  const day = i + 1;
                  const dayEvents = results.filter(
                    (e) =>
                      e.date ===
                      `2026-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
                  );
                  return (
                    <div
                      className={`calendar-day ${dayEvents.length ? 'has-events' : ''}`}
                      key={day}
                    >
                      <span>{day}</span>
                      {dayEvents.map((e) => (
                        <button key={e.id} onClick={() => onOpen(e)} title={e.title}>
                          {e.title}
                        </button>
                      ))}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
      {!results.length && (
        <Empty
          title="A little breathing room."
          description="Try another event type or area to see more from your community."
        />
      )}
    </>
  );
}
export function EventDetail({ event, onClose }: { event: Event; onClose: () => void }) {
  const broker = brokerOpens.find((b) => b.id === event.id);
  const [rsvps, setRsvps] = useStoredState<string[]>('rsvps', []);
  const going = rsvps.includes(event.id);
  return (
    <Modal title={event.title} onClose={onClose} wide={!!broker}>
      <img
        className="detail-cover event-cover"
        src={event.image}
        alt="Illustrative event setting"
      />
      <div className="event-detail-header">
        <span className="status blue">{event.type}</span>
        <span>{event.area}</span>
      </div>
      <div className="event-facts">
        <span>
          <CalendarDays size={17} />
          {dateLabel(event.date, { weekday: 'long', month: 'long', day: 'numeric' })}
        </span>
        <span>
          <Clock size={17} />
          {event.time}
        </span>
        <span>
          <MapPin size={17} />
          {event.location}
        </span>
      </div>
      <p className="event-description">{event.description}</p>
      <div className="host-card">
        <div className="feature-icon">
          <Users size={21} />
        </div>
        <div>
          <span className="eyebrow small">YOUR HOST{broker ? 'S' : ''}</span>
          <strong>{event.host}</strong>
          {broker && <p>{broker.sponsor}</p>}
        </div>
      </div>
      {broker && (
        <>
          <div className="route-map">
            <div className="map-street street-one" />
            <div className="map-street street-two" />
            <div className="map-street street-three" />
            <div className="map-park">
              {event.area === 'Tulsa metro' ? 'MIDTOWN' : 'EAST WICHITA'}
            </div>
            <svg viewBox="0 0 700 150" preserveAspectRatio="none" aria-hidden="true">
              <path
                d="M65 110 L155 50 L275 90 L385 45 L495 105 L625 50"
                fill="none"
                stroke="#418FDE"
                strokeWidth="3"
                strokeDasharray="6 5"
              />
            </svg>
            {broker.listings.map((l, i) => (
              <span
                className="map-stop"
                key={l.id}
                style={{ left: `${8 + i * 17}%`, top: `${i % 2 ? 24 : 58}%` }}
              >
                {i + 1}
              </span>
            ))}
            <span className="map-caption">
              <Route size={13} />
              Illustrative route · not for navigation
            </span>
          </div>
          <div className="section-heading">
            <h2>{broker.listings.length} homes. Plenty to discover.</h2>
            <span className="muted">Suggested stop order</span>
          </div>
          <div className="broker-listings">
            {broker.listings.map((l, i) => (
              <article className="broker-listing" key={l.id}>
                <div className="listing-image">
                  <img src={l.image} alt={`Illustrative home for stop ${i + 1}`} />
                  <span>
                    STOP {i + 1} · {l.time}
                  </span>
                </div>
                <div className="listing-content">
                  <strong>{money(l.price)}</strong>
                  <h3>{l.address}</h3>
                  <p>
                    {l.beds} beds · {l.baths} baths
                  </p>
                  <div>
                    <span>{l.agent}</span>
                    <small>{l.brokerage}</small>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
      <div className="rsvp-footer">
        <div>
          <strong>{going ? 'You’re on the list.' : 'We’d love to see you.'}</strong>
          <p>{going ? 'Your RSVP is saved on this device.' : 'Demo RSVPs stay on this device.'}</p>
        </div>
        <button
          className={`btn ${going ? 'secondary' : 'primary'}`}
          onClick={() =>
            setRsvps(going ? rsvps.filter((id) => id !== event.id) : [...rsvps, event.id])
          }
        >
          {going ? (
            <>
              <Check size={16} />
              Cancel RSVP
            </>
          ) : (
            'Count me in'
          )}
        </button>
      </div>
    </Modal>
  );
}
