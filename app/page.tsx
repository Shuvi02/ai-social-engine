import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-indigo-500/30">
      {/* Dynamic Background Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-indigo-600/20 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-0 right-[-10%] w-[600px] h-[600px] bg-purple-600/10 blur-[150px] rounded-full"></div>
      </div>

      <div className="relative z-10">
        {/* Navigation Bar */}
        <nav className="border-b border-white/10 bg-slate-950/50 backdrop-blur-md">
          <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
            <Link href="/" className="group flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-lg font-bold text-white shadow-lg transition-transform group-hover:scale-105">
                P
              </div>
              <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-xl font-bold tracking-tight text-transparent">
                PostPilot 
              </span>
            </Link>
            <div className="flex items-center gap-6">
              <Link
                href="/login"
                className="text-sm font-semibold text-gray-300 transition-colors hover:text-white"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-white px-6 py-2.5 text-sm font-bold text-slate-900 shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all hover:bg-gray-100"
              >
                Get Started
              </Link>
            </div>
          </div>
        </nav>

        {/* Cinematic Hero Section */}
        <main className="mx-auto max-w-7xl px-6 pb-24 pt-32 text-center">
          <div className="mx-auto max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="inline-flex items-center rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-sm font-medium text-indigo-300">
              <span className="mr-2 flex h-2 w-2 animate-pulse rounded-full bg-indigo-500"></span>
              Introducing the Ultimate AI Engine
            </div>
            <h1 className="text-5xl font-extrabold leading-tight tracking-tight text-white md:text-7xl">
              From Idea to{" "}
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Published Post
              </span>{" "}
              in 60 Seconds
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-gray-400 md:text-xl">
              Stop wasting hours writing social media content. PostPilot  understands your goal, crafts platform-perfect posts for LinkedIn, Instagram, Twitter and Telegram, and publishes them with one click.
            </p>
            <div className="flex justify-center pt-8">
              <Link
                href="/signup"
                className="group relative inline-flex h-14 items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-10 font-medium text-white shadow-[0_0_40px_rgba(99,102,241,0.4)] transition hover:scale-105 hover:shadow-[0_0_60px_rgba(99,102,241,0.6)]"
              >
                <span className="absolute h-0 w-0 rounded-full bg-white opacity-10 transition-all duration-300 ease-out group-hover:h-32 group-hover:w-full"></span>
                <span className="relative flex items-center gap-2 text-lg font-bold">
                  Start for Free
                  <svg
                    className="h-5 w-5 transition-transform group-hover:translate-x-1.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </span>
              </Link>
            </div>
          </div>
        </main>

        {/* Core Features Grid */}
        <div className="border-t border-white/5 mx-auto max-w-7xl px-6 py-24">
          <div className="grid gap-8 md:grid-cols-3">
            {/* Feature Card 1 */}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition hover:-translate-y-1 hover:bg-white/10 hover:shadow-2xl">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/20 text-3xl text-indigo-400">
                🎯
              </div>
              <h3 className="mb-3 text-2xl font-bold text-white">
                Tell us your goal
              </h3>
              <p className="leading-relaxed text-gray-400">
                Hiring someone? Launching a product? Just describe what you need — our AI handles the rest.
              </p>
            </div>
            
            {/* Feature Card 2 */}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition hover:-translate-y-1 hover:bg-white/10 hover:shadow-2xl">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-500/20 text-3xl text-purple-400">
                ⚡
              </div>
              <h3 className="mb-3 text-2xl font-bold text-white">
                AI writes it perfectly
              </h3>
              <p className="leading-relaxed text-gray-400">
                Get professionally crafted posts tailored for each platform — tone, hashtags, emojis and all.
              </p>
            </div>
            
            {/* Feature Card 3 */}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition hover:-translate-y-1 hover:bg-white/10 hover:shadow-2xl">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-500/20 text-3xl text-pink-400">
                🚀
              </div>
              <h3 className="mb-3 text-2xl font-bold text-white">
                One click to publish
              </h3>
              <p className="leading-relaxed text-gray-400">
                Review your content, select your platforms, and go live instantly. No copy-pasting ever again.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
