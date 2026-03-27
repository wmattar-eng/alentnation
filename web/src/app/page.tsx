import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      {/* Hero Section */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="text-2xl font-bold">TalentNation</div>
        <nav className="flex gap-4">
          <Link href="/login">
            <Button variant="ghost" className="text-white">Sign In</Button>
          </Link>
          <Link href="/register">
            <Button>Get Started</Button>
          </Link>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-6">
          Saudi Arabia's
          <br />
          <span className="text-blue-400">Creative Talent</span>
        </h1>
        
        <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10">
          Connect with top designers, developers, and creatives.
          Post projects, hire talent, and grow your business.
        </p>

        <div className="flex gap-4 justify-center">
          <Link href="/register?role=talent">
            <Button size="lg" className="text-lg px-8">
              I'm a Talent
            </Button>
          </Link>
          <Link href="/register?role=client">
            <Button size="lg" variant="outline" className="text-lg px-8 text-white border-white hover:bg-white hover:text-slate-900">
              Hire Talent
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto mt-20">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-400">10K+</div>
            <div className="text-gray-400">Talents</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-400">5K+</div>
            <div className="text-gray-400">Projects</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-400">50M+</div>
            <div className="text-gray-400">SAR Earned</div>
          </div>
        </div>
      </main>

      {/* Sponsor CTA */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-blue-900/50 rounded-2xl p-10 text-center">
          <h2 className="text-3xl font-bold mb-4">Become a Sponsor</h2>
          <p className="text-gray-300 mb-8 max-w-xl mx-auto">
            Reach thousands of Saudi creatives. Promote your projects, 
            hire faster, and align with Vision 2030.
          </p>
          <Link href="/sponsors">
            <Button size="lg" variant="secondary">
              View Sponsorship Plans
            </Button>
          </Link>
        </div>
      </section>

      <footer className="container mx-auto px-4 py-8 text-center text-gray-500">
        <p>© 2026 TalentNation. Aligning with Vision 2030.</p>
      </footer>
    </div>
  );
}
