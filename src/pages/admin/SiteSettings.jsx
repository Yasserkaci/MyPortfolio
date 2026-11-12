import { useEffect, useMemo, useState } from 'react'
import { NavLink, useParams, Navigate } from 'react-router-dom'
import { Plus, Trash, ArrowCounterClockwise, Eye, EyeSlash } from '@phosphor-icons/react'
import { useSettings, applyTheme } from '../../lib/settings'
import { DEFAULT_SETTINGS, FONTS, RADII } from '../../lib/defaults'
import { getPath, setPath } from '../../lib/utils'
import { Field, Input, Textarea, Toggle, ColorField, TagInput, ImageField, Select, SortableList, useToast } from '../../components/admin/ui'

const TABS = [
  ['identity', 'Identity'],
  ['hero', 'Hero'],
  ['nav', 'Navigation'],
  ['marquee', 'Marquee'],
  ['work', 'Work'],
  ['about', 'About'],
  ['experience', 'Experience'],
  ['contact', 'Contact'],
  ['socials', 'Socials'],
  ['footer', 'Footer'],
  ['theme', 'Theme'],
  ['sections', 'Sections'],
  ['seo', 'SEO'],
]

export default function SiteSettings() {
  const { tab } = useParams()
  const { settings, save } = useSettings()
  const [draft, setDraft] = useState(settings)
  const [dirty, setDirty] = useState(false)
  const [busy, setBusy] = useState(false)
  const toast = useToast()

  useEffect(() => {
    if (!dirty) setDraft(settings)
  }, [settings, dirty])

  // Live theme preview while editing; revert to saved on unmount.
  useEffect(() => {
    applyTheme(draft.theme)
  }, [draft.theme])
  useEffect(() => () => applyTheme(settings.theme), [settings.theme])

  const get = (p, fb = '') => getPath(draft, p, fb)
  const set = (p) => (v) => {
    setDraft((d) => setPath(d, p, v))
    setDirty(true)
  }

  const resetTab = () => {
    if (!tab) return
    setDraft((d) => ({ ...d, [tab]: structuredClone(DEFAULT_SETTINGS[tab]) }))
    setDirty(true)
  }

  const onSave = async () => {
    setBusy(true)
    try {
      await save(draft)
      setDirty(false)
      toast('Settings saved')
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  if (!tab) return <Navigate to="/admin/settings/identity" replace />

  const ctx = { get, set, draft, setDraft: (fn) => { setDraft(fn); setDirty(true) } }

  return (
    <>
      <div className="admin-head">
        <div>
          <h1>Site settings</h1>
          <p>Every word, color and image on the public site. Changes go live when you save.</p>
        </div>
        <div className="admin-actions">
          <button className="btn btn-ghost btn-sm" onClick={resetTab} type="button" title="Reset this tab to defaults">
            <ArrowCounterClockwise size={14} /> Reset tab
          </button>
          <button className="btn btn-primary btn-sm" onClick={onSave} disabled={!dirty || busy}>
            {busy ? 'Saving…' : dirty ? 'Save changes' : 'Saved'}
          </button>
        </div>
      </div>

      <nav className="tabs">
        {TABS.map(([id, label]) => (
          <NavLink to={`/admin/settings/${id}`} key={id}>
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="panel">
        {tab === 'identity' && <Identity {...ctx} />}
        {tab === 'hero' && <Hero {...ctx} />}
        {tab === 'nav' && <NavTab {...ctx} />}
        {tab === 'marquee' && <MarqueeTab {...ctx} />}
        {tab === 'work' && <WorkTab {...ctx} />}
        {tab === 'about' && <AboutTab {...ctx} />}
        {tab === 'experience' && <ExperienceTab {...ctx} />}
        {tab === 'contact' && <ContactTab {...ctx} />}
        {tab === 'socials' && <SocialsTab {...ctx} />}
        {tab === 'footer' && <FooterTab {...ctx} />}
        {tab === 'theme' && <ThemeTab {...ctx} />}
        {tab === 'sections' && <SectionsTab {...ctx} />}
        {tab === 'seo' && <SeoTab {...ctx} />}
      </div>
    </>
  )
}

/* ---------------- tabs ---------------- */

function Identity({ get, set }) {
  return (
    <div className="form">
      <div className="grid-2">
        <Field label="Name" htmlFor="name">
          <Input id="name" value={get('identity.name')} onChange={set('identity.name')} />
        </Field>
        <Field label="Role / title" htmlFor="role" hint="Shown in the hero status line.">
          <Input id="role" value={get('identity.role')} onChange={set('identity.role')} />
        </Field>
      </div>
      <Field label="Short bio" htmlFor="bio" hint="Used for SEO fallbacks and sharing.">
        <Textarea id="bio" value={get('identity.shortBio')} onChange={set('identity.shortBio')} rows={2} />
      </Field>
      <div className="grid-2">
        <Field label="Email" htmlFor="email" hint="Displayed in the contact section.">
          <Input id="email" type="email" value={get('identity.email')} onChange={set('identity.email')} />
        </Field>
        <Field label="Location" htmlFor="loc">
          <Input id="loc" value={get('identity.location')} onChange={set('identity.location')} />
        </Field>
      </div>
      <div className="grid-2">
        <Field label="Availability text" htmlFor="avail">
          <Input id="avail" value={get('identity.availability')} onChange={set('identity.availability')} />
        </Field>
        <div className="field">
          <label>&nbsp;</label>
          <Toggle checked={get('identity.showAvailability', true)} onChange={set('identity.showAvailability')} label="Show availability in hero" />
        </div>
      </div>
      <Field label="CV / resume" hint="Upload a PDF or paste a link. Shows a Download CV button when set.">
        <ResumeField value={get('identity.resumeUrl')} onChange={set('identity.resumeUrl')} />
      </Field>
    </div>
  )
}

function ResumeField({ value, onChange }) {
  const [busy, setBusy] = useState(false)
  const toast = useToast()
  const pick = async (file) => {
    if (!file) return
    setBusy(true)
    try {
      const { uploadMedia } = await import('../../lib/supabase')
      onChange(await uploadMedia(file, 'resume'))
      toast('Uploaded')
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setBusy(false)
    }
  }
  return (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
      <input style={{ flex: 1, minWidth: 200 }} type="text" value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder="https://…/cv.pdf" />
      <label className="btn btn-ghost btn-sm" style={{ cursor: 'pointer' }}>
        {busy ? 'Uploading…' : 'Upload PDF'}
        <input type="file" accept="application/pdf" hidden onChange={(e) => pick(e.target.files?.[0])} />
      </label>
    </div>
  )
}

function Hero({ get, set }) {
  return (
    <div className="grid-2" style={{ gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)' }}>
      <div className="form">
        <Field label="Headline" htmlFor="hl" hint="Keep it to two lines. Words animate in one by one.">
          <Textarea id="hl" value={get('hero.headline')} onChange={set('hero.headline')} rows={2} />
        </Field>
        <Field label="Emphasised word(s)" htmlFor="em" hint="Rendered in italic accent color. Must match a word in the headline.">
          <Input id="em" value={get('hero.emphasis')} onChange={set('hero.emphasis')} />
        </Field>
        <Field label="Subtext" htmlFor="sub" hint="One or two sentences, max 20 words.">
          <Textarea id="sub" value={get('hero.subtext')} onChange={set('hero.subtext')} rows={2} />
        </Field>
        <div className="grid-2">
          <Field label="Primary button label" htmlFor="p1">
            <Input id="p1" value={get('hero.primaryCta.label')} onChange={set('hero.primaryCta.label')} />
          </Field>
          <Field label="Primary button link" htmlFor="p2" hint="#work, #contact, or a full URL.">
            <Input id="p2" value={get('hero.primaryCta.href')} onChange={set('hero.primaryCta.href')} />
          </Field>
        </div>
        <div className="grid-2">
          <Field label="Secondary button label" htmlFor="s1" hint="Leave empty to hide.">
            <Input id="s1" value={get('hero.secondaryCta.label')} onChange={set('hero.secondaryCta.label')} />
          </Field>
          <Field label="Secondary button link" htmlFor="s2">
            <Input id="s2" value={get('hero.secondaryCta.href')} onChange={set('hero.secondaryCta.href')} />
          </Field>
        </div>
      </div>
      <div className="form">
        <Toggle checked={get('hero.showImage', false)} onChange={set('hero.showImage')} label="Show an image beside the headline" />
        <Field label="Hero image" hint="Portrait works best (4:5). A photo of you or your workspace.">
          <ImageField value={get('hero.imageUrl')} onChange={set('hero.imageUrl')} folder="hero" label="hero image" />
        </Field>
        <Field label="Image alt text" htmlFor="alt">
          <Input id="alt" value={get('hero.imageAlt')} onChange={set('hero.imageAlt')} />
        </Field>
      </div>
    </div>
  )
}

function LinkList({ items, onChange, labelKey = 'label', hrefKey = 'href', hrefLabel = 'Link', addLabel = 'Add link' }) {
  const update = (i, k, v) => onChange(items.map((it, j) => (j === i ? { ...it, [k]: v } : it)))
  return (
    <div className="form">
      <SortableList
        items={items.map((it, i) => ({ ...it, _id: `${i}` }))}
        getId={(it) => it._id}
        onReorder={(next) => onChange(next.map((it) => { const c = { ...it }; delete c._id; return c }))}
        render={(it, i) => (
          <>
            <div className="grid-2" style={{ gap: 10 }}>
              <input value={it[labelKey] || ''} onChange={(e) => update(i, labelKey, e.target.value)} placeholder="Label" aria-label="Label" />
              <input value={it[hrefKey] || ''} onChange={(e) => update(i, hrefKey, e.target.value)} placeholder={hrefLabel} aria-label={hrefLabel} />
            </div>
            <button type="button" className="icon-btn danger" onClick={() => onChange(items.filter((_, j) => j !== i))} aria-label="Remove">
              <Trash size={16} />
            </button>
          </>
        )}
      />
      <button type="button" className="btn btn-ghost btn-sm" style={{ width: 'fit-content' }} onClick={() => onChange([...items, { [labelKey]: '', [hrefKey]: '' }])}>
        <Plus size={14} /> {addLabel}
      </button>
    </div>
  )
}

function NavTab({ get, set }) {
  return (
    <div className="form">
      <div className="grid-3">
        <Field label="Logo text" htmlFor="logo" hint="Short initials get an accent dot.">
          <Input id="logo" value={get('nav.logoText')} onChange={set('nav.logoText')} />
        </Field>
        <Field label="Nav button label" htmlFor="ncta" hint="Leave empty to hide.">
          <Input id="ncta" value={get('nav.ctaLabel')} onChange={set('nav.ctaLabel')} />
        </Field>
        <Field label="Nav button link" htmlFor="nhref">
          <Input id="nhref" value={get('nav.ctaHref')} onChange={set('nav.ctaHref')} />
        </Field>
      </div>
      <Field label="Menu links" hint="Use #work, #about, #experience, #contact for sections, or any URL.">
        <LinkList items={get('nav.links', [])} onChange={set('nav.links')} />
      </Field>
    </div>
  )
}

function MarqueeTab({ get, set }) {
  return (
    <div className="form">
      <Toggle checked={get('marquee.enabled', true)} onChange={set('marquee.enabled')} label="Show scrolling stack strip under the hero" />
      <Field label="Items" hint="Press Enter after each.">
        <TagInput value={get('marquee.items', [])} onChange={set('marquee.items')} />
      </Field>
    </div>
  )
}

function WorkTab({ get, set }) {
  return (
    <div className="form">
      <Field label="Section heading" htmlFor="wh">
        <Input id="wh" value={get('work.heading')} onChange={set('work.heading')} />
      </Field>
      <Field label="Intro" htmlFor="wi">
        <Textarea id="wi" value={get('work.intro')} onChange={set('work.intro')} rows={2} />
      </Field>
      <p className="muted" style={{ fontSize: '0.9rem' }}>
        Projects themselves are managed under Projects.
      </p>
    </div>
  )
}

function AboutTab({ get, set }) {
  const paras = get('about.paragraphs', [])
  const stats = get('about.stats', [])
  return (
    <div className="grid-2" style={{ gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)' }}>
      <div className="form">
        <Field label="Section heading" htmlFor="ah">
          <Input id="ah" value={get('about.heading')} onChange={set('about.heading')} />
        </Field>
        <Field label="Paragraphs">
          <div className="form">
            {paras.map((p, i) => (
              <div key={i} style={{ display: 'flex', gap: 8 }}>
                <textarea value={p} rows={3} style={{ flex: 1, minHeight: 0 }} onChange={(e) => set('about.paragraphs')(paras.map((x, j) => (j === i ? e.target.value : x)))} />
                <button type="button" className="icon-btn danger" onClick={() => set('about.paragraphs')(paras.filter((_, j) => j !== i))} aria-label="Remove paragraph">
                  <Trash size={16} />
                </button>
              </div>
            ))}
            <button type="button" className="btn btn-ghost btn-sm" style={{ width: 'fit-content' }} onClick={() => set('about.paragraphs')([...paras, ''])}>
              <Plus size={14} /> Add paragraph
            </button>
          </div>
        </Field>
        <Field label="Stats" hint="Big number plus a label. Three fit best. First one uses the accent color.">
          <div className="form">
            {stats.map((s, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '120px 1fr auto', gap: 8 }}>
                <input value={s.value || ''} placeholder="6+" onChange={(e) => set(`about.stats.${i}.value`)(e.target.value)} aria-label="Value" />
                <input value={s.label || ''} placeholder="Products shipped" onChange={(e) => set(`about.stats.${i}.label`)(e.target.value)} aria-label="Label" />
                <button type="button" className="icon-btn danger" onClick={() => set('about.stats')(stats.filter((_, j) => j !== i))} aria-label="Remove stat">
                  <Trash size={16} />
                </button>
              </div>
            ))}
            <button type="button" className="btn btn-ghost btn-sm" style={{ width: 'fit-content' }} onClick={() => set('about.stats')([...stats, { value: '', label: '' }])}>
              <Plus size={14} /> Add stat
            </button>
          </div>
        </Field>
      </div>
      <div className="form">
        <Field label="Portrait" hint="Leave empty to hide the photo cell.">
          <ImageField value={get('about.imageUrl')} onChange={set('about.imageUrl')} folder="about" square label="portrait" />
        </Field>
      </div>
    </div>
  )
}

function ExperienceTab({ get, set }) {
  return (
    <div className="form">
      <Field label="Section heading" htmlFor="eh">
        <Input id="eh" value={get('experience.heading')} onChange={set('experience.heading')} />
      </Field>
      <Field label="Intro" htmlFor="ei">
        <Textarea id="ei" value={get('experience.intro')} onChange={set('experience.intro')} rows={2} />
      </Field>
      <p className="muted" style={{ fontSize: '0.9rem' }}>
        Entries are managed under Experience.
      </p>
    </div>
  )
}

function ContactTab({ get, set }) {
  return (
    <div className="form">
      <Field label="Heading" htmlFor="ch">
        <Input id="ch" value={get('contact.heading')} onChange={set('contact.heading')} />
      </Field>
      <Field label="Text" htmlFor="ct">
        <Textarea id="ct" value={get('contact.text')} onChange={set('contact.text')} rows={2} />
      </Field>
      <Toggle checked={get('contact.showForm', true)} onChange={set('contact.showForm')} label="Show contact form (messages land in the admin inbox)" />
      <div className="grid-2">
        <Field label="Send button label" htmlFor="cb">
          <Input id="cb" value={get('contact.buttonLabel')} onChange={set('contact.buttonLabel')} />
        </Field>
        <Field label="Success message" htmlFor="cs">
          <Input id="cs" value={get('contact.successText')} onChange={set('contact.successText')} />
        </Field>
      </div>
    </div>
  )
}

function SocialsTab({ get, set }) {
  return (
    <Field label="Social links" hint="Shown in the contact section and footer. Empty URLs are hidden.">
      <LinkList items={get('socials', [])} onChange={set('socials')} hrefKey="url" hrefLabel="https://" addLabel="Add social" />
    </Field>
  )
}

function FooterTab({ get, set }) {
  return (
    <div className="form">
      <Field label="Footer text" htmlFor="ft">
        <Input id="ft" value={get('footer.text')} onChange={set('footer.text')} />
      </Field>
      <Toggle checked={get('footer.showYear', true)} onChange={set('footer.showYear')} label="Show current year" />
    </div>
  )
}

function ThemeTab({ get, set }) {
  return (
    <div className="form">
      <div className="grid-3">
        <Field label="Accent color" hint="Used once, everywhere: buttons, emphasis, highlights.">
          <ColorField value={get('theme.accent')} onChange={set('theme.accent')} />
        </Field>
        <Field label="Background">
          <ColorField value={get('theme.bg')} onChange={set('theme.bg')} />
        </Field>
        <Field label="Surface (cards)">
          <ColorField value={get('theme.surface')} onChange={set('theme.surface')} />
        </Field>
      </div>
      <div className="grid-3">
        <Field label="Text color">
          <ColorField value={get('theme.fg')} onChange={set('theme.fg')} />
        </Field>
        <Field label="Muted text">
          <ColorField value={get('theme.muted')} onChange={set('theme.muted')} />
        </Field>
        <Field label="Corner style" htmlFor="radius">
          <Select id="radius" value={get('theme.radius')} onChange={set('theme.radius')} options={Object.entries(RADII).map(([v, r]) => ({ value: v, label: r.label }))} />
        </Field>
      </div>
      <div className="grid-3">
        <Field label="Font" htmlFor="font">
          <Select id="font" value={get('theme.font')} onChange={set('theme.font')} options={Object.entries(FONTS).map(([v, f]) => ({ value: v, label: f.label }))} />
        </Field>
        <div className="field">
          <label>Effects</label>
          <div style={{ display: 'grid', gap: 10 }}>
            <Toggle checked={get('theme.grain', true)} onChange={set('theme.grain')} label="Film grain overlay" />
            <Toggle checked={get('theme.smoothScroll', true)} onChange={set('theme.smoothScroll')} label="Smooth scrolling" />
            <Toggle checked={get('theme.preloader', true)} onChange={set('theme.preloader')} label="Curtain intro on first visit" />
          </div>
        </div>
        <div className="field">
          <label>Preview</label>
          <div style={{ display: 'grid', gap: 10, padding: 18, borderRadius: 'var(--r-card)', background: 'var(--bg)', border: '1px solid var(--line)' }}>
            <span className="h3">
              Aa <em style={{ color: 'var(--accent)', fontStyle: 'italic', fontWeight: 400 }}>Bb</em>
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <span className="btn btn-primary btn-sm">Primary</span>
              <span className="btn btn-ghost btn-sm">Ghost</span>
            </div>
          </div>
        </div>
      </div>
      <p className="muted" style={{ fontSize: '0.9rem' }}>
        Changes preview live in this admin. Save to apply them to the public site.
      </p>
    </div>
  )
}

function SectionsTab({ get, set }) {
  const sections = get('sections', [])
  const merged = useMemo(() => {
    const ids = new Set(sections.map((s) => s.id))
    return [...sections, ...DEFAULT_SETTINGS.sections.filter((d) => !ids.has(d.id))]
  }, [sections])
  return (
    <div className="form">
      <p className="muted" style={{ fontSize: '0.9rem' }}>
        Drag to reorder homepage sections. Toggle the eye to hide one without deleting its content.
      </p>
      <SortableList
        items={merged}
        getId={(s) => s.id}
        onReorder={set('sections')}
        rowClass="section-row"
        render={(s) => (
          <>
            <b style={{ fontWeight: 540 }}>{s.label || s.id}</b>
            <button
              type="button"
              className={`icon-btn ${s.enabled === false ? '' : 'on'}`}
              onClick={() => set('sections')(merged.map((x) => (x.id === s.id ? { ...x, enabled: x.enabled === false } : x)))}
              aria-label={s.enabled === false ? 'Show section' : 'Hide section'}
            >
              {s.enabled === false ? <EyeSlash size={18} /> : <Eye size={18} />}
            </button>
          </>
        )}
      />
    </div>
  )
}

function SeoTab({ get, set }) {
  return (
    <div className="form">
      <Field label="Browser title" htmlFor="st">
        <Input id="st" value={get('seo.title')} onChange={set('seo.title')} />
      </Field>
      <Field label="Meta description" htmlFor="sd" hint="Around 150 characters.">
        <Textarea id="sd" value={get('seo.description')} onChange={set('seo.description')} rows={2} />
      </Field>
      <Field label="Social share image" hint="1200 x 630 recommended.">
        <ImageField value={get('seo.ogImage')} onChange={set('seo.ogImage')} folder="seo" label="share image" />
      </Field>
    </div>
  )
}

