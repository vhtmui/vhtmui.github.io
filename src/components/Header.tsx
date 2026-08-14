import ThemeToggle from './ThemeToggle'
import Navigator from './my/Navigator'

export default function Header({ top = 0 }: { top?: number }) {
  return (
    <header
      className="bg-background fixed z-11 flex h-14 w-full flex-row items-center gap-2 border-b pr-2 pl-2"
      style={{ top: `${top}px` }}
    >
      <Navigator />
      <ThemeToggle />
    </header>
  )
}
