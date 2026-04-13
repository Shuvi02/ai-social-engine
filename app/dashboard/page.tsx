import Link from "next/link";

export default function DashboardIndex() {
  return (
    <div className="flex min-h-[85vh] flex-col items-center justify-center px-4 py-16 text-center sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl animate-in fade-in zoom-in-95 duration-700">
        {/* Welcome Icon / Graphic */}
        <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-indigo-50 shadow-inner ring-1 ring-indigo-100">
          <span className="text-5xl">👋</span>
        </div>
        
        {/* Headings */}
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-6xl">
          What would you like to create today?
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-500">
          Ready to take your social media presence to the next level? Generate stunning, platform-ready campaigns effortlessly or review your past activity!
        </p>

        {/* Action Buttons */}
        <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
          <Link
            href="/dashboard/new"
            className="group relative flex w-full items-center justify-center overflow-hidden rounded-2xl bg-indigo-600 px-8 py-4 font-bold text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all hover:scale-105 hover:bg-indigo-700 hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] sm:w-auto text-lg"
          >
            <span className="mr-2.5 text-2xl">✨</span>
            Create New Campaign
          </Link>
          
          <Link
            href="/dashboard/history"
            className="group flex w-full items-center justify-center rounded-2xl border-2 border-gray-200 bg-white px-8 py-4 font-bold text-gray-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-gray-300 hover:bg-gray-50 hover:shadow-md sm:w-auto text-lg"
          >
            <span className="mr-2.5 text-2xl transition-transform group-hover:-rotate-12">🕒</span>
            View History
          </Link>
        </div>
      </div>
    </div>
  );
}
