"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    // 1. Instantiate the browser safely pulling mapped logic centrally from the unified library
    const supabase = createClient();
    
    // 2. Eradicate localized Supabase user-state natively mapping the API out correctly
    await supabase.auth.signOut();
    
    // 3. Purge manual access tokens mapped statically matching middleware loops gracefully
    document.cookie = "sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    
    // 4. Navigate out immediately to login parameters closing layout flows.
    router.push("/login");
  };

  // Navigational logic map representing routing definitions precisely matching user workflows
  const navLinks = [
    { name: "Dashboard", href: "/dashboard", icon: "📊", exact: true },
    { name: "New Campaign", href: "/dashboard/new", icon: "✨", exact: false },
    { name: "History", href: "/dashboard/history", icon: "🕒", exact: false },
  ];

  return (
    <div className="flex h-screen w-full flex-col font-sans bg-[#FDFDFD] overflow-hidden md:flex-row">
      {/* Dynamic Sidebar Application Wrapper (Desktop + Mobile) */}
      <aside className="flex w-full flex-col border-b border-gray-200 bg-white shadow-[2px_0_8px_rgba(0,0,0,0.02)] md:w-64 md:border-b-0 md:border-r">
        {/* PostPilot  Dashboard Branding Header */}
        <div className="flex h-16 shrink-0 items-center border-b border-gray-100 px-6">
          <Link href="/" className="group flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-lg font-bold text-white shadow-md transition-transform group-hover:scale-105">
              P
            </div>
            <span className="text-lg font-bold tracking-tight text-gray-900">
              PostPilot 
            </span>
          </Link>
        </div>

        {/* Dynamic Navigation Sidebar Link Matrix */}
        <nav className="flex flex-1 flex-row gap-2 overflow-x-auto p-4 md:flex-col md:gap-1.5 md:overflow-y-auto">
          {navLinks.map((link) => {
            // Evaluates exact route matching algorithm enforcing focus natively natively enforcing root mappings exclusively
            const isActive = link.exact 
              ? pathname === link.href 
              : pathname.startsWith(link.href);
              
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex whitespace-nowrap items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-600/10"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <span className="text-xl">{link.icon}</span>
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Persistent Desktop Logout Button Hook */}
        <div className="border-t border-gray-100 p-4 hidden md:block">
          <button
            onClick={handleLogout}
            className="group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-gray-600 transition-colors hover:bg-red-50 hover:text-red-700"
          >
            <span className="text-xl transition-transform group-hover:-translate-x-0.5">🚪</span>
            Logout
          </button>
        </div>
        
        {/* Persistent Mobile Responsive Logout Alignment */}
        <div className="absolute top-3 right-4 md:hidden">
            <button
              onClick={handleLogout}
              className="rounded-lg p-2 text-gray-400 text-xl hover:bg-red-50 hover:text-red-600 transition"
              title="Logout Securely"
            >
              🚪
            </button>
        </div>
      </aside>

      {/* Primary Children Application Viewport Renderer Area */}
      <main className="relative flex-1 overflow-y-auto bg-gray-50/50">
        <div className="h-full w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
