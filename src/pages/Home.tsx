import { Link } from 'react-router'

const cards = [
  { to: '/docs', label: 'Docs' },
  { to: '/mac-converter', label: 'MAC Address Converter' },
  { to: '/testpage', label: 'Test Page' },
  { to: '/dufs/常用软件/?noscript', label: 'Dufs' },
]

export default function Home() {
  return (
    <div className="card-grid">
      {cards.map((card) => (
        <Link key={card.to} to={card.to} className="card">
          {card.label}
        </Link>
      ))}
    </div>
  )
}
