import { Link } from 'react-router'
import { HOME_LINKS } from '../config/links'

export default function Home() {
  return (
    <div className="card-grid">
      {HOME_LINKS.map((card) => (
        <Link
          key={card.to}
          to={card.to}
          reloadDocument={card.static}
          className="card"
        >
          {card.label}
        </Link>
      ))}
    </div>
  )
}
