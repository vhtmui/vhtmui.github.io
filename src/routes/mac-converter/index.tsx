import { createFileRoute } from '@tanstack/react-router'
import { useState, useRef, useEffect } from 'react'
import { Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'

export const Route = createFileRoute('/mac-converter/')({ component: MacConverter })

const macExp = [
  { name: 'Hyphen-Hex', nums: 2, symbol: '-' },
  { name: 'Colon-Hex', nums: 2, symbol: ':' },
  { name: 'CiscoLike-Hyphen-Hex', nums: 4, symbol: '-' },
  { name: 'CiscoLike-Colon-Hex', nums: 4, symbol: ':' },
]

function cleanMac(mac: string) {
  return mac.replace(/[^A-Fa-f0-9]/g, '').toUpperCase()
}

function macFormatter(macAddr: string, eachCounts: number, separator: string) {
  const cleaned = macAddr.replace(/[^A-Fa-f0-9]/g, '').slice(0, 12).toUpperCase()
  let output = ''
  for (let i = 0; i < cleaned.length; i += 1) {
    output += cleaned[i]
    if (i % eachCounts === eachCounts - 1 && i !== cleaned.length - 1) {
      output += separator
    }
  }
  return output
}

function CopyText({ text, delay = 750 }: { text: string; delay?: number }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    if (copied || !text) return
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), delay)
    } catch {
      // ignore
    }
  }

  return (
    <div className="flex items-center align-middle">
      <span className="mr-auto">{text}</span>
      <Button variant="ghost" size="icon" className="ml-1" onClick={handleCopy} disabled={copied || text.length === 0}>
        {copied ? <Check /> : <Copy />}
      </Button>
    </div>
  )
}

function MacConverter() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [macAddress, setMacAddress] = useState('')

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.select()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const cleaned = cleanMac(macAddress)

  return (
    <div className="mac-converter flex w-full flex-col items-center gap-2.5 p-5vw-10vw min-h-full">
      <h1 className="pt-10vh text-center">Mac Address Converter</h1>
      <div className="max-w-70 w-full">
        <Input
          ref={inputRef}
          placeholder="CTRL K"
          value={cleaned}
          onChange={(e) => setMacAddress(e.target.value)}
        />
        <span className="text-sm text-muted-foreground mt-1 block">len: {cleaned.length}</span>
      </div>
      {cleaned.length > 0 && (
        <ul className="w-90% max-w-16rem flex flex-col gap-2">
          {macExp.map((exp, i) => (
            <li key={i}>
              <CopyText text={macFormatter(cleaned, exp.nums, exp.symbol)} />
              {i < macExp.length - 1 && <Separator className="mt-2" />}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
