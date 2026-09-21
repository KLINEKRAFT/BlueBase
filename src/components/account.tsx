'use client';
import { useState } from 'react';
import {
  ChartNoAxesCombined,
  Wallet,
  Users,
  CalendarDays,
  ArrowUpRight,
  Blocks,
  Check,
  Sun,
  Monitor,
  Moon,
  Mail,
  BookOpen,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { tools, agent } from '@/data/mock';
import type { AgentProfile } from '@/lib/types';
import { PageHeading, SectionHeading, SaveButton, useStoredState, Modal } from './ui';
const icons = {
  chart: ChartNoAxesCombined,
  wealth: Wallet,
  vendor: Users,
  event: CalendarDays,
  soon: Blocks,
};
export function Tools({ navigate }: { navigate: (path: string) => void }) {
  return (
    <>
      <PageHeading
        eyebrow="ONE LOGIN. MORE POSSIBILITIES."
        title="Everything you need, together."
        description="Your everyday essentials. And a little of what’s ahead."
      />
      <div className="tools-intro">
        <div className="feature-icon">
          <Blocks size={28} />
        </div>
        <div>
          <h2>A home for your whole business.</h2>
          <p>One profile connects your tools, your community, and your next chapter.</p>
        </div>
        <span className="soft-label">
          <Check size={15} />
          Connected to BlueBase
        </span>
      </div>
      <h2 className="standalone-heading">Your workspace</h2>
      <div className="tools-grid">
        {tools.map((t) => {
          const Icon = icons[t.icon as keyof typeof icons];
          return t.status === 'Available' ? (
            <button key={t.id} className="tool-card" onClick={() => navigate(t.href)}>
              <span className="feature-icon">
                <Icon size={25} />
              </span>
              <span className="tool-text">
                <h3>{t.name}</h3>
                <p>{t.description}</p>
                <span className="tool-status">
                  <i />
                  Ready when you are
                </span>
              </span>
              <ArrowUpRight size={21} />
            </button>
          ) : (
            <article key={t.id} className="tool-card coming-soon">
              <span className="feature-icon">
                <Icon size={25} />
              </span>
              <span className="tool-text">
                <h3>{t.name}</h3>
                <p>{t.description}</p>
                <span className="status neutral">Coming soon</span>
              </span>
            </article>
          );
        })}
      </div>
    </>
  );
}
export function Profile() {
  const [profile, setProfile, loaded] = useStoredState<AgentProfile>('profile', agent);
  const [saved, setSaved] = useState(false);
  return (
    <>
      <PageHeading
        eyebrow="YOUR BLUEBASE IDENTITY"
        title="A profile that’s all you."
        description="One identity, shared across your BlueBase workspace."
      />
      <section className="panel profile-panel">
        <div className="profile-cover" />
        <div className="profile-identity">
          <img src={profile.avatar} alt="Demo profile portrait" />
          <div>
            <h2>{profile.name}</h2>
            <p>
              {profile.company} · {profile.office}
            </p>
          </div>
          <span className="status blue">Agent profile</span>
        </div>
        <form
          key={loaded ? 'loaded' : 'initial'}
          onChange={() => setSaved(false)}
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            setProfile({
              ...profile,
              name: String(fd.get('name')).trim(),
              company: String(fd.get('company')),
              office: String(fd.get('office')).trim(),
              email: String(fd.get('email')),
              phone: String(fd.get('phone')),
              license: String(fd.get('license')),
              market: String(fd.get('market')),
            });
            setSaved(true);
          }}
        >
          <SectionHeading
            title="The essentials"
            description="Demo changes are saved to this browser."
          />
          <div className="form-grid">
            <label>
              Full name
              <input name="name" defaultValue={profile.name} required maxLength={80} />
            </label>
            <label>
              Contact email
              <input type="email" name="email" defaultValue={profile.email} required />
            </label>
            <label>
              Company
              <select name="company" defaultValue={profile.company}>
                <option>Coldwell Banker Select</option>
                <option>Coldwell Banker Plaza</option>
              </select>
            </label>
            <label>
              Office
              <input name="office" defaultValue={profile.office} required maxLength={80} />
            </label>
            <label>
              Phone
              <input name="phone" type="tel" defaultValue={profile.phone} />
            </label>
            <label>
              License number
              <input name="license" defaultValue={profile.license} />
            </label>
            <label>
              Default market
              <select name="market" defaultValue={profile.market}>
                <option>Tulsa metro</option>
                <option>Wichita metro</option>
                <option>Broken Arrow</option>
                <option>Jenks / Bixby</option>
              </select>
            </label>
          </div>
          <p className="muted form-help">
            Your contact email updates your profile; demo sign-in remains agent@bluebase.demo. The
            portrait is illustrative.
          </p>
          <div className="form-footer">
            {saved && (
              <span className="success-text" role="status">
                <Check size={16} />
                Profile saved
              </span>
            )}
            <SaveButton saved={saved} />
          </div>
        </form>
      </section>
    </>
  );
}
export function Settings({
  appearance,
  setAppearance,
}: {
  appearance: string;
  setAppearance: (v: string) => void;
}) {
  const [prefs, setPrefs] = useStoredState<Record<string, boolean>>('notification-preferences', {
    closings: true,
    goals: true,
    events: true,
    vendors: false,
    wealth: true,
  });
  return (
    <>
      <PageHeading
        eyebrow="JUST THE WAY YOU LIKE IT"
        title="Make yourself at home."
        description="A few small choices to make BlueBase work for you."
      />
      <div className="settings-layout">
        <section className="panel">
          <SectionHeading title="Appearance" description="Choose the light that feels right." />
          <div className="appearance-options">
            {[
              { name: 'System', Icon: Monitor },
              { name: 'Light', Icon: Sun },
              { name: 'Dark', Icon: Moon },
            ].map(({ name, Icon }) => (
              <button
                key={name}
                className={`appearance-option ${appearance === name ? 'active' : ''}`}
                onClick={() => setAppearance(name)}
                aria-pressed={appearance === name}
              >
                <Icon size={25} />
                <strong>{name}</strong>
                {appearance === name && <Check size={16} />}
              </button>
            ))}
          </div>
          <p className="muted form-help">Your preference is saved automatically on this device.</p>
        </section>
        <section className="panel">
          <SectionHeading
            title="Keep me in the loop"
            description="Choose what matters to you. Demo preferences save locally."
          />
          {Object.entries({
            closings: ['Production updates', 'New closings and changes to your pipeline.'],
            goals: ['Goals & milestones', 'A little recognition for your progress.'],
            events: ['Events & broker opens', 'What’s happening around your community.'],
            vendors: ['New trusted partners', 'Fresh additions to your vendor collection.'],
            wealth: ['Wealth Builder', 'Confirmation when your contributions post.'],
          }).map(([id, [title, description]]) => (
            <div className="preference-row" key={id}>
              <div>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
              <button
                className={`switch ${prefs[id] ? 'on' : ''}`}
                role="switch"
                aria-label={title}
                aria-checked={prefs[id]}
                onClick={() => setPrefs({ ...prefs, [id]: !prefs[id] })}
              >
                <i />
              </button>
            </div>
          ))}
        </section>
        <div className="info-note">
          <ShieldCheck size={20} />
          <span>
            This is a fictional workspace. No production account, email delivery, or financial
            connection is enabled.
          </span>
        </div>
      </div>
    </>
  );
}
const resources = [
  {
    title: 'Getting comfortable with BlueBase',
    description: 'A quick guide to your new workspace.',
    icon: BookOpen,
    body: 'Start with Production for the full picture of your business. Edit your goals, explore monthly performance, and review your recent activity. Wealth Builder tracks demo contributions. Vendor List connects you with fictional service partners, and Events brings your community together.',
  },
  {
    title: 'Your demo, explained',
    description: 'What’s real, what’s illustrative, and what saves.',
    icon: ShieldCheck,
    body: 'Every person, property association, vendor, transaction, balance, and event is fictional. Goals, favorites, RSVPs, profile changes, appearance, and notification preferences are saved in your browser. They do not sync to another device. Demo sign-in is a convenience, not a security boundary.',
  },
  {
    title: 'A little help when you need it',
    description: 'Where support will live as BlueBase grows.',
    icon: Mail,
    body: 'The demo has no live support inbox. For now, share product feedback with your internal project team. In a production release, this space will connect agents with their company support team and office resources.',
  },
];
export function Resources() {
  const [selected, setSelected] = useState<number | null>(null);
  return (
    <>
      <PageHeading
        eyebrow="IN YOUR CORNER"
        title="A little guidance goes a long way."
        description="Find your footing, get an answer, and get back to what you do best."
      />
      <div className="resources-list">
        {resources.map((r, i) => (
          <button className="panel resource-card" key={r.title} onClick={() => setSelected(i)}>
            <span className="feature-icon">
              <r.icon size={24} />
            </span>
            <span>
              <h2>{r.title}</h2>
              <p>{r.description}</p>
            </span>
            <ChevronRight size={20} />
          </button>
        ))}
      </div>
      {selected !== null && (
        <Modal title={resources[selected].title} onClose={() => setSelected(null)}>
          <p className="prose">{resources[selected].body}</p>
        </Modal>
      )}
    </>
  );
}
