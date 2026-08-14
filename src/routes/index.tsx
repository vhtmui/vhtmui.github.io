import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  const className =
    'text-2xl font-bold grow min-w-50 max-w-1/1 h-50 flex items-center justify-center whitespace-normal text-center'

  return (
    <main className="page-wrap px-4 pb-8 pt-14">
      <div className="flex min-h-screen w-full flex-wrap items-start gap-8 p-10">
        <Link to="/mac-converter" className={`${className} btn-outline`}>MAC Address Converter</Link>
        <Link to="/dufs" className={`${className} btn-outline`}>Dufs</Link>
        <Link to="/docs" className={`${className} btn-outline`}>Docs</Link>
        <Link to="/testpage" className={`${className} btn-outline`}>Test Page</Link>
      </div>
    </main>
  )
}
