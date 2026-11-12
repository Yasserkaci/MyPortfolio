import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="not-found">
      <div style={{ display: 'grid', gap: 20, justifyItems: 'center' }}>
        <h1 className="display">Nothing here.</h1>
        <p className="lede">The page you were looking for does not exist or was unpublished.</p>
        <Link to="/" className="btn btn-primary">
          Back home
        </Link>
      </div>
    </div>
  )
}
