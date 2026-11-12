import { ArrowUp } from '@phosphor-icons/react'
import { useSettings } from '../lib/settings'
import { useSmoothScroll } from './SmoothScroll'
import { SplitWords } from './motion'

export default function Footer() {
  const { settings } = useSettings()
  const { footer, socials, identity } = settings
  const { scrollTo } = useSmoothScroll()
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-name" aria-hidden="true">
          <SplitWords text={identity.name} inView stagger={0.08} />
        </div>
        <div className="footer-row">
          <div>
            {footer.showYear && <span>© {year} </span>}
            {footer.text || identity.name}
          </div>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            {socials
              .filter((s) => s.url)
              .map((s) => (
                <a key={s.label} href={s.url} target="_blank" rel="noreferrer">
                  <span className="roll">
                    <span data-text={s.label}>{s.label}</span>
                  </span>
                </a>
              ))}
          </div>
          <button className="to-top" onClick={() => scrollTo(0)}>
            <span className="roll">
              <span data-text="Back to top">Back to top</span>
            </span>
            <ArrowUp size={14} />
          </button>
        </div>
      </div>
    </footer>
  )
}
