import { LinkCard } from "@/components/home-com";

export default function Home() {
  return (
    <main className="flex flex-wrap items-start gap-8 p-10 min-h-screen w-full">
      <LinkCard href="/mac-converter">Mac Address Converter</LinkCard>
      <LinkCard href="/dufs">Dufs</LinkCard>
      <LinkCard href="/pending">Pending...</LinkCard>
    </main>
  );
}
