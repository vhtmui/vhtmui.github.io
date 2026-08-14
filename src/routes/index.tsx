import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  const className =
    'text-2xl font-bold grow min-w-50 max-w-1/1 h-50 flex items-center justify-center whitespace-normal text-center'

  return (
    <div className="flex min-h-screen w-full flex-wrap items-start gap-8 p-10">
      <Link to="/mac-converter" className={`btn btn-outline ${className}`}>MAC Address Converter</Link>
      <Link to="/dufs" className={`btn btn-outline ${className}`}>Dufs</Link>
      <Link to="/docs" className={`btn btn-outline ${className}`}>Docs</Link>
      <Link to="/testpage" className={`btn btn-outline ${className}`}>Test Page</Link>
    </div>
  )
}
