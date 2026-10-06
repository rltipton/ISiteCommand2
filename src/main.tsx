import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-zinc-900">
      <nav className="flex items-center justify-between px-6 py-4 border-b">
        <span className="font-black tracking-widest">ISITECOMMAND</span>
        <Link href="/login" className="px-4 py-2 bg-black text-white rounded font-semibold">Login</Link>
      </nav>

      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <p className="text-sm tracking-[0.3em] font-bold text-zinc-500 mb-6">BUILT OUT OF GRATITUDE. ENGINEERED FOR PRECISION.</p>
        <h1 className="text-5xl md:text-7xl font-black leading-[0.9] tracking-tight">
          KEEP YOUR SYSTEM.<br/>ADD COMMAND.
        </h1>
        <p className="mt-6 text-xl text-zinc-600 max-w-2xl mx-auto">
          The field ops layer that sits on top of the system you already run. 
          No new accounting. No file storage. Just command for your crews, 
          estimates, and photos — linked to YOUR Drive.
        </p>
        <div className="mt-10 flex gap-4 justify-center">
          <Link href="/login" className="px-8 py-4 bg-black text-white rounded-lg font-bold text-lg">Enter Command</Link>
          <a href="#how" className="px-8 py-4 border border-black rounded-lg font-bold text-lg">How it works</a>
        </div>

        <div id="how" className="mt-24 grid md:grid-cols-3 gap-6 text-left">
          <div className="border p-6 rounded-xl">
            <h3 className="font-black">1. KEEP YOUR SYSTEM</h3>
            <p className="mt-2 text-zinc-600">We don't replace QuickBooks, Jobber, or your folders. We command them.</p>
          </div>
          <div className="border p-6 rounded-xl">
            <h3 className="font-black">2. BRING YOUR OWN STORAGE</h3>
            <p className="mt-2 text-zinc-600">Estimates, proposals, photos live in YOUR Google Drive / OneDrive. We only save the link. Zero storage cost.</p>
          </div>
          <div className="border p-6 rounded-xl">
            <h3 className="font-black">3. ACTIVE EMPLOYEE TIERING</h3>
            <p className="mt-2 text-zinc-600">Only pay for active field guys. No bench charges. Built for contractors, by contractors.</p>
          </div>
        </div>
      </section>

      <footer className="border-t py-8 text-center text-sm text-zinc-500">
        iSiteCommand2 • Built out of gratitude • © {new Date().getFullYear()}
      </footer>
    </main>
  )
}
