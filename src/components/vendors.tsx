'use client';
import { useState } from 'react';
import { Search, Heart, Plus, ShieldCheck, ArrowRight, RefreshCw } from 'lucide-react';
import { Empty, Modal, PageHeading, useStoredState } from './ui';
import { useDirectory, refreshDirectory } from '@/lib/vendors/use-directory';
import { VendorCard, marketLabel } from './vendor-directory/vendor-card';
import { VendorDetail } from './vendor-directory/vendor-detail';
import { RecommendForm } from './vendor-directory/recommend-form';
export function Vendors({ initialQuery = '' }: { initialQuery?: string }) {
  const { data, error, loading } = useDirectory();
  const [query, setQuery] = useState(initialQuery),
    [category, setCategory] = useState(''),
    [market, setMarket] = useState('');
  const [favorites, setFavorites] = useStoredState<string[]>('favorites', []);
  const [onlyFavorites, setOnlyFavorites] = useState(false),
    [ownReviews, setOwnReviews] = useState(false),
    [recommend, setRecommend] = useState(false),
    [receipts, setReceipts] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const toggle = (id: string) =>
    setFavorites(favorites.includes(id) ? favorites.filter((x) => x !== id) : [...favorites, id]);
  const pool = data
    ? ownReviews
      ? [...data.vendors, ...data.reviewedVendors].filter((v) =>
          v.reviews.some((r) => r.agentId === data.agentId),
        )
      : data.vendors
    : [];
  const results = pool.filter(
    (v) =>
      (
        v.name +
        ' ' +
        v.description +
        ' ' +
        v.services.join(' ') +
        ' ' +
        v.categoryIds.map((id) => data?.categories.find((c) => c.id === id)?.name).join(' ') +
        ' ' +
        marketLabel(v, data?.markets || [])
      )
        .toLowerCase()
        .includes(query.trim().toLowerCase()) &&
      (!category || v.categoryIds.includes(category)) &&
      (!market || v.markets.some((m) => m.id === market)) &&
      (!onlyFavorites || favorites.includes(v.id)),
  );
  const detail = data && [...data.vendors, ...data.reviewedVendors].find((v) => v.id === selected);
  return (
    <div className="directory-page">
      <PageHeading
        eyebrow="YOUR PEOPLE. YOUR COMMUNITY."
        title="Vendor List"
        description="Trusted professionals, recommended by our agents."
      >
        <button className="btn primary" disabled={!data} onClick={() => setRecommend(true)}>
          <Plus size={17} />
          Recommend a Vendor
        </button>
      </PageHeading>
      <section className="directory-intro">
        <div>
          <span className="eyebrow">A GOOD CONNECTION GOES A LONG WAY</span>
          <h2>
            Good people.
            <br />
            <em>In your corner.</em>
          </h2>
          <p>
            Recommended by agents. Rated by agents.
            <br />A thoughtfully curated network for every step of home.
          </p>
        </div>
        <div className="directory-promise">
          <ShieldCheck size={25} />
          <strong>
            A personal invitation.
            <br />A shared commitment.
          </strong>
          <p>Agent referral · internal review · community support</p>
          <span>{data?.rules.minimumRating.toFixed(1) || '4.0'} minimum BlueBase rating</span>
        </div>
      </section>
      <div className="directory-demo-banner">
        LIVE DEMO · Real companies. Sample BlueBase ratings, referrals, memberships, and charity
        records.
      </div>
      {error && (
        <div role="alert" className="directory-error">
          <p>{error}</p>
          <button className="btn secondary" onClick={() => void refreshDirectory()}>
            <RefreshCw size={15} />
            Try again
          </button>
        </div>
      )}
      {!data && loading ? (
        <div className="directory-loading" role="status">
          Loading your community…
          <div className="skeleton" />
          <div className="skeleton" />
        </div>
      ) : (
        data && (
          <>
            <div className="directory-filters">
              <label className="search-input">
                <Search size={19} />
                <input
                  aria-label="Search vendors"
                  placeholder="Who do you need?"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
              <select
                aria-label="Vendor market"
                value={market}
                onChange={(e) => setMarket(e.target.value)}
              >
                <option value="">All markets</option>
                {data.markets.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
              <select
                aria-label="Vendor category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">All categories</option>
                {data.categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <button
                className={`btn secondary ${onlyFavorites ? 'selected' : ''}`}
                aria-label="Saved vendors"
                aria-pressed={onlyFavorites}
                onClick={() => setOnlyFavorites(!onlyFavorites)}
              >
                <Heart size={17} fill={onlyFavorites ? 'currentColor' : 'none'} />
                <span>Saved</span>
              </button>
            </div>
            <div className="directory-quick-categories">
              {[
                ['', 'All professionals'],
                ['home-inspector', 'Home inspection'],
                ['title-company', 'Title'],
                ['mortgage-lender', 'Mortgage'],
                ['home-warranty', 'Home warranty'],
                ['hvac', 'HVAC'],
                ['plumber', 'Plumbing'],
                ['electrician', 'Electrical'],
                ['roofing', 'Roofing'],
              ].map(([id, label]) => (
                <button
                  key={id}
                  className={category === id ? 'active' : ''}
                  aria-pressed={category === id}
                  onClick={() => setCategory(id)}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="directory-results-heading">
              <span>
                <strong>{results.length}</strong> {ownReviews ? 'reviewed' : 'curated'}{' '}
                {results.length === 1 ? 'professional' : 'professionals'}
              </span>
              <div>
                <button aria-pressed={ownReviews} onClick={() => setOwnReviews(!ownReviews)}>
                  {ownReviews ? 'Browse directory' : 'Your reviews'}
                </button>
                <button onClick={() => setReceipts(true)}>
                  Your recommendations <span>{data.recommendations.length}</span>
                </button>
              </div>
            </div>
            {ownReviews && (
              <p className="directory-demo-note">
                Your review history includes vendors that are no longer eligible for the directory.
              </p>
            )}
            <div className="directory-grid">
              {results.map((v, i) => (
                <VendorCard
                  key={v.id}
                  vendor={v}
                  categories={data.categories}
                  markets={data.markets}
                  favorite={favorites.includes(v.id)}
                  onFavorite={() => toggle(v.id)}
                  onOpen={() => setSelected(v.id)}
                  featured={i === 0}
                />
              ))}
            </div>
            {!results.length && (
              <div className="directory-empty">
                <Empty
                  title={
                    ownReviews
                      ? 'Your perspective belongs here.'
                      : 'The right connection is still out there.'
                  }
                  description={
                    ownReviews
                      ? 'Browse a profile and share your first experience.'
                      : 'Try a different category or market, or recommend someone you trust.'
                  }
                />
                <button
                  className="btn secondary"
                  onClick={() => {
                    setQuery('');
                    setCategory('');
                    setMarket('');
                    setOnlyFavorites(false);
                    setOwnReviews(false);
                  }}
                >
                  Browse all professionals
                  <ArrowRight size={16} />
                </button>
              </div>
            )}
          </>
        )
      )}
      {recommend && data && <RecommendForm snapshot={data} onClose={() => setRecommend(false)} />}
      {detail && data && (
        <VendorDetail
          key={detail.id}
          vendor={detail}
          snapshot={data}
          onClose={() => setSelected(null)}
        />
      )}
      {receipts && data && (
        <Modal title="Your recommendations" onClose={() => setReceipts(false)}>
          <p className="directory-form-intro">
            Every connection starts with an agent. These recommendations are saved for internal
            review.
          </p>
          {data.recommendations.length ? (
            data.recommendations.map((r) => (
              <article className="recommend-receipt" key={r.id}>
                <span className="status blue">{r.status.replaceAll('_', ' ')}</span>
                <h3>{r.companyName}</h3>
                <p>{new Date(r.submittedAt).toLocaleString()}</p>
                <small>Notification queued · email provider not connected</small>
              </article>
            ))
          ) : (
            <Empty
              title="Know someone great?"
              description="Recommend a vendor and follow your submission here."
            />
          )}
        </Modal>
      )}
    </div>
  );
}
