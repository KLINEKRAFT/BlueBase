'use client';
import { useState } from 'react';
import {
  Star,
  Phone,
  Mail,
  Globe,
  MapPin,
  HeartHandshake,
  ShieldCheck,
  ArrowUpRight,
  Check,
  MessageSquare,
} from 'lucide-react';
import { Modal } from '../ui';
import type { DirectoryVendor, DirectorySnapshot } from '@/lib/vendors/types';
import { VendorLogo, marketLabel } from './vendor-card';
import { submitReview } from '@/lib/vendors/client';
import { refreshDirectory } from '@/lib/vendors/use-directory';
export function VendorDetail({
  vendor,
  snapshot,
  onClose,
}: {
  vendor: DirectoryVendor;
  snapshot: DirectorySnapshot;
  onClose: () => void;
}) {
  const mine = vendor.reviews.find((r) => r.agentId === snapshot.agentId);
  const [rating, setRating] = useState(mine?.rating || 0);
  const [experience, setExperience] = useState<'agent' | 'client'>(mine?.experience || 'agent');
  const [comment, setComment] = useState(mine?.comment || '');
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const suspended = !['active', 'renewal_due'].includes(vendor.status);
  return (
    <Modal
      title={vendor.name}
      onClose={() => {
        if (!busy) onClose();
      }}
      wide
    >
      <div className="directory-detail-identity">
        <VendorLogo vendor={vendor} large />
        <div>
          <div className="directory-card-category">
            {vendor.categoryIds
              .map((id) => snapshot.categories.find((c) => c.id === id)?.name)
              .join(' · ')}
          </div>
          <span className={`directory-membership ${suspended ? 'inactive' : ''}`}>
            <ShieldCheck size={14} />
            {suspended ? 'Not currently in the directory' : 'BlueBase Vendor · demo membership'}
          </span>
        </div>
      </div>
      <div className="directory-demo-banner">
        Company information is sourced from its website. BlueBase ratings, referrals, membership,
        and charity records below are samples, not verified claims.
      </div>
      <p className="directory-detail-description">{vendor.description}</p>
      <div className="directory-detail-markets">
        <MapPin size={17} />
        {marketLabel(vendor, snapshot.markets)}
      </div>
      <div className="directory-contact-actions">
        {vendor.phone && (
          <a className="btn primary" href={`tel:${vendor.phone}`}>
            <Phone size={17} />
            Call
          </a>
        )}
        {vendor.email && (
          <a className="btn secondary" href={`mailto:${vendor.email}`}>
            <Mail size={17} />
            Email
          </a>
        )}
        <a
          className="btn secondary"
          href={vendor.website}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Globe size={17} />
          Visit website
          <ArrowUpRight size={14} />
        </a>
      </div>
      <div className="directory-detail-columns">
        <section>
          <h3>Here to help with</h3>
          <div className="directory-services">
            {vendor.services.map((s) => (
              <span key={s}>{s}</span>
            ))}
          </div>
          <div className="directory-contact-facts">
            {vendor.contactName && <p>Contact: {vendor.contactName}</p>}
            {vendor.phone && <p>{vendor.phone}</p>}
            {vendor.email && <p>{vendor.email}</p>}
            {!vendor.email && <p>For email or a named contact, visit the company website.</p>}
          </div>
          <a
            className="directory-source"
            href={vendor.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Company source · checked {vendor.sourceCheckedAt}
            <ArrowUpRight size={13} />
          </a>
        </section>
        <section className="directory-community">
          <HeartHandshake size={24} />
          <span className="eyebrow">COMMUNITY PARTNER · SAMPLE</span>
          <h3>{vendor.charity?.name || 'Charity confirmation pending'}</h3>
          <p>
            An annual commitment to an approved charitable organization is part of participation.
          </p>
          <div>
            <strong>${snapshot.rules.annualContribution}</strong>
            <span>
              every{' '}
              {snapshot.rules.renewalMonths === 12
                ? 'year'
                : `${snapshot.rules.renewalMonths} months`}
            </span>
          </div>
          {vendor.status === 'renewal_due' && (
            <span className="directory-renewal">
              Renewal approaching · current contribution is valid
            </span>
          )}
          <small>No actual donation or charity affiliation is claimed.</small>
        </section>
      </div>
      <section className="directory-review-section">
        <div className="directory-section-heading">
          <div>
            <span className="eyebrow">RECOMMENDED BY AGENTS. RATED BY AGENTS.</span>
            <h3>The BlueBase perspective.</h3>
          </div>
          <button
            className="btn secondary"
            onClick={() => {
              setEditing(!editing);
              setNotice('');
            }}
          >
            <MessageSquare size={16} />
            {mine ? 'Edit your rating' : 'Share your experience'}
          </button>
        </div>
        {suspended && (
          <p className="directory-error">
            This vendor is hidden from normal browse and search. Your rating and its history are
            preserved; you can still update your own review. Reinstatement requires internal review.
          </p>
        )}
        <div className="directory-rating-summary">
          <div>
            <strong>{vendor.rating === null ? '—' : vendor.rating.toFixed(1)}</strong>
            <span>
              <Star size={15} fill="currentColor" />{' '}
              {vendor.reviewCount
                ? `${vendor.reviewCount} sample BlueBase ratings`
                : 'No ratings yet'}
            </span>
            <small>
              {vendor.recommendationCount} sample agent referral · no public ratings imported
            </small>
          </div>
          <div className="directory-distribution">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = vendor.reviews.filter((r) => r.rating === stars).length;
              return (
                <div key={stars} aria-label={`${stars} stars: ${count} ratings`}>
                  <span>{stars}</span>
                  <Star size={10} />
                  <i>
                    <b
                      style={{
                        width: `${vendor.reviewCount ? (count / vendor.reviewCount) * 100 : 0}%`,
                      }}
                    />
                  </i>
                  <span>{count}</span>
                </div>
              );
            })}
          </div>
        </div>
        {editing && (
          <form
            className="directory-review-form"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!rating) {
                setError('Choose a star rating before saving.');
                return;
              }
              setBusy(true);
              setError('');
              try {
                const result = await submitReview({
                  vendorId: vendor.id,
                  rating,
                  experience,
                  comment,
                });
                await refreshDirectory();
                setNotice(
                  result.suspended
                    ? 'Rating saved. This vendor is now hidden from the directory because its average is below the minimum. Its history is preserved.'
                    : 'Your sample rating is saved. You can update it any time.',
                );
                setEditing(false);
              } catch (err) {
                setError((err as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            <fieldset className="directory-fieldset" disabled={busy}>
              <legend>{mine ? 'Update your experience' : 'How was the experience?'}</legend>
              <fieldset className="rating-picker">
                <legend className="sr-only">Your rating</legend>
                {[1, 2, 3, 4, 5].map((n) => (
                  <label key={n} title={`${n} ${n === 1 ? 'star' : 'stars'}`}>
                    <input
                      type="radio"
                      name="rating"
                      value={n}
                      checked={rating === n}
                      onChange={() => setRating(n)}
                    />
                    <Star size={29} fill={rating >= n ? 'currentColor' : 'none'} />
                    <span className="sr-only">
                      {n} {n === 1 ? 'star' : 'stars'}
                    </span>
                  </label>
                ))}
              </fieldset>
              <fieldset className="experience-picker">
                <legend>Whose experience are you sharing?</legend>
                <label>
                  <input
                    type="radio"
                    name="experience"
                    checked={experience === 'agent'}
                    onChange={() => setExperience('agent')}
                  />
                  My experience
                </label>
                <label>
                  <input
                    type="radio"
                    name="experience"
                    checked={experience === 'client'}
                    onChange={() => setExperience('client')}
                  />
                  My client’s experience
                </label>
              </fieldset>
              <label className="directory-textarea">
                A few details <span className="optional">Optional · sample comments only</span>
                <textarea
                  rows={3}
                  maxLength={2000}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="What would help another agent?"
                />
              </label>
              {error && (
                <p role="alert" className="directory-error">
                  {error}
                </p>
              )}
              <div className="modal-actions">
                <button type="button" className="btn secondary" onClick={() => setEditing(false)}>
                  Cancel
                </button>
                <button className="btn primary" disabled={busy}>
                  {busy ? 'Saving…' : mine ? 'Update rating' : 'Save rating'}
                </button>
              </div>
            </fieldset>
          </form>
        )}
        {notice && (
          <p role="status" className="directory-success">
            <Check size={18} />
            {notice}
          </p>
        )}
        <div className="directory-comments">
          {vendor.reviews
            .filter((r) => r.comment)
            .slice(0, 5)
            .map((r) => (
              <article key={r.id}>
                <div>
                  <span className="review-avatar">
                    {r.agentName
                      .split(' ')
                      .map((s) => s[0])
                      .slice(0, 2)
                      .join('')}
                  </span>
                  <span>
                    <strong>{r.agentId === snapshot.agentId ? 'Your review' : r.agentName}</strong>
                    <small>
                      {r.experience === 'agent' ? 'Agent experience' : 'Client experience'} ·{' '}
                      {new Date(r.updatedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </small>
                  </span>
                  <span className="review-stars">
                    <Star size={12} fill="currentColor" />
                    {r.rating}
                  </span>
                </div>
                <p>{r.comment}</p>
                <span className="review-sample">SAMPLE REVIEW</span>
              </article>
            ))}
          {!vendor.reviewCount && (
            <p className="directory-no-reviews">
              A new connection, ready for a first perspective. Unrated vendors have no implied
              score.
            </p>
          )}
        </div>
      </section>
    </Modal>
  );
}
