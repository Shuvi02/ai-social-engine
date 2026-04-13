"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

// Define the precise typing structure required for mapped UI payloads
interface PostData {
  content: string;
  hashtags: string[];
}

interface CampaignPreviewData {
  campaignId?: string; // Captured dynamically from the generation route DB insertion mappings
  linkedin: PostData;
  instagram: PostData;
  twitter: PostData;
  telegram?: PostData;
}

export default function PreviewPage() {
  const router = useRouter();

  const [data, setData] = useState<CampaignPreviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isLinkedInConnected, setIsLinkedInConnected] = useState<boolean | null>(null);
  const [disconnecting, setDisconnecting] = useState(false);

  // Maintain interactive boolean states for platform selector checks cleanly
  const [selectedPlatforms, setSelectedPlatforms] = useState({
    linkedin: true,
    instagram: true,
    twitter: true,
    telegram: true,
  });

  useEffect(() => {
    // Automatically parse temporary generation payloads out of memory safely mapping to page UI
    const storedData = localStorage.getItem("generatedCampaignPreview");

    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        setData(parsed);
      } catch (error) {
        console.error("Failed to parse localStorage memory blocks.", error);
      }
    }
    setLoading(false);

    // Actively probe database for third-party linked properties natively
    async function checkConnections() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data } = await supabase
        .from('connected_accounts')
        .select('id')
        .eq('user_id', user.id)
        .eq('platform', 'linkedin')
        .maybeSingle();
        
      setIsLinkedInConnected(!!data);
    }
    
    checkConnections();
  }, []);

  const togglePlatform = (platform: "linkedin" | "instagram" | "twitter" | "telegram") => {
    setSelectedPlatforms((prev) => ({
      ...prev,
      [platform]: !prev[platform],
    }));
  };

  const handleDisconnectLinkedIn = async () => {
    if (!confirm('Disconnect your LinkedIn account? You can reconnect anytime.')) return;
    setDisconnecting(true);
    try {
      const res = await fetch('/api/auth/linkedin/disconnect', { method: 'DELETE' });
      if (!res.ok) throw new Error('Disconnect failed.');
      router.refresh(); // Reload page so Connect LinkedIn button appears fresh
    } catch (err) {
      console.error(err);
      alert('Failed to disconnect LinkedIn. Please try again.');
    } finally {
      setDisconnecting(false);
    }
  };

  const handlePublish = async () => {
    // Array of platforms that contain a true boolean flag statically
    const platformsToPublish = Object.keys(selectedPlatforms).filter(
      (p) => selectedPlatforms[p as keyof typeof selectedPlatforms]
    );

    if (platformsToPublish.length === 0) {
      alert("Please ensure at least one platform is selected to publish.");
      return;
    }

    setPublishing(true);
    setSuccess(false);

    try {
      // Directs explicit payload parameters cleanly into the publish action route
      const response = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId: data?.campaignId || "mock-testing-campaign-id",
          platforms: platformsToPublish,
        }),
      });

      if (!response.ok) {
        throw new Error("HTTP Publishing sequence explicitly rejected.");
      }

      setSuccess(true);
      // Cleanest strategy is usually clearing the cache, but leaving it available so users don't break navigating natively handles back loops best.
      // localStorage.removeItem("generatedCampaignPreview");
    } catch (error) {
      console.error(error);
      alert("There was an unexpected error publishing your content natively. Please try again.");
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[85vh] items-center justify-center bg-[#FDFDFD]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  // Graceful fallback UI block if navigation rules bypass cache
  if (!data) {
    return (
      <div className="flex flex-col min-h-[85vh] items-center justify-center bg-[#FDFDFD] px-6 text-center">
        <h2 className="mb-4 text-3xl font-extrabold text-gray-900">Preview Buffer Empty</h2>
        <p className="mb-8 max-w-lg text-lg text-gray-500">
          We couldn't detect any active campaign artifacts in your browser memory. Please generate a new campaign to preview your content natively here.
        </p>
        <button
          onClick={() => router.push("/dashboard/new")}
          className="rounded-2xl bg-indigo-600 px-8 py-4 text-lg font-bold text-white shadow-xl hover:bg-indigo-700 transition"
        >
          Go to Generation Pipeline
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-[90vh] bg-[#FDFDFD] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-12 animate-in fade-in zoom-in-95 duration-500">
        
        <div className="space-y-4 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl">
            Review Your Generated Content
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-500">
            Preview your AI-generated posts mapped intelligently across network boundaries. Select your desired platforms using the checkboxes and click publish.
          </p>
        </div>

        {/* Dynamic Publish Celebration Display Hook */}
        {success && (
          <div className="mx-auto flex max-w-2xl animate-in fade-in slide-in-from-top-4 flex-col items-center rounded-2xl border border-green-200 bg-green-50/80 p-8 text-center shadow-lg backdrop-blur-md">
            <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">🎉</span>
            <h3 className="text-2xl font-extrabold text-green-900">Successfully Launched!</h3>
            <p className="mt-2 text-lg text-green-800">
              Your generated metadata has been tracked into memory mappings properly queued.
            </p>
            <button
              onClick={() => router.push("/dashboard")}
              className="mt-6 inline-flex w-full sm:w-auto items-center justify-center rounded-xl bg-green-600 px-8 py-3 text-sm font-bold text-white shadow-sm hover:bg-green-700 transition"
            >
              Back to Overview
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 xl:gap-8 lg:grid-cols-2 xl:grid-cols-4 pt-4">
          {/* LinkedIn Content Target Block */}
          <div
            className={`relative flex h-full flex-col overflow-hidden rounded-3xl border-2 transition-all duration-300 ${
              selectedPlatforms.linkedin
                ? "border-blue-500 bg-white shadow-[0_8px_30px_rgb(59,130,246,0.1)]"
                : "border-gray-200 bg-gray-50/50 opacity-60 backdrop-blur-sm grayscale-[0.8] hover:opacity-100"
            } p-6 sm:p-8`}
          >
            <div className="mb-6 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100/80 text-2xl">
                  💼
                </div>
                <h2 className="text-xl font-bold tracking-tight text-gray-900">LinkedIn</h2>
              </div>
              <input
                type="checkbox"
                className="h-6 w-6 cursor-pointer rounded-md border-gray-300 text-blue-600 focus:ring-blue-600 transition"
                checked={selectedPlatforms.linkedin}
                onChange={() => togglePlatform("linkedin")}
              />
            </div>
            <div className="flex-1 whitespace-pre-wrap text-[15px] leading-relaxed text-gray-700">
              {data.linkedin.content}
            </div>
            <div className="mt-8 border-t border-gray-100 pt-6">
              <p className="flex flex-wrap gap-2 text-sm font-semibold tracking-wide text-blue-600">
                {data.linkedin.hashtags.map((tag: string, i: number) => (
                  <span key={i} className="rounded-md bg-blue-50 px-2 py-1">{tag.startsWith("#") ? tag : `#${tag}`}</span>
                ))}
              </p>
            </div>
          </div>

          {/* Instagram Content Target Block */}
          <div
            className={`relative flex h-full flex-col overflow-hidden rounded-3xl border-2 transition-all duration-300 ${
              selectedPlatforms.instagram
                ? "border-pink-500 bg-white shadow-[0_8px_30px_rgb(236,72,153,0.1)]"
                : "border-gray-200 bg-gray-50/50 opacity-60 backdrop-blur-sm grayscale-[0.8] hover:opacity-100"
            } p-6 sm:p-8`}
          >
            <div className="mb-6 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-100/80 text-2xl">
                  📸
                </div>
                <h2 className="text-xl font-bold tracking-tight text-gray-900">Instagram</h2>
              </div>
              <input
                type="checkbox"
                className="h-6 w-6 cursor-pointer rounded-md border-gray-300 text-pink-500 focus:ring-pink-500 transition"
                checked={selectedPlatforms.instagram}
                onChange={() => togglePlatform("instagram")}
              />
            </div>
            <div className="flex-1 whitespace-pre-wrap text-[15px] leading-relaxed text-gray-700">
              {data.instagram.content}
            </div>
            <div className="mt-8 border-t border-gray-100 pt-6">
              <p className="flex flex-wrap gap-2 text-sm font-semibold tracking-wide text-pink-500">
                {data.instagram.hashtags.map((tag: string, i: number) => (
                  <span key={i} className="rounded-md bg-pink-50 px-2 py-1">{tag.startsWith("#") ? tag : `#${tag}`}</span>
                ))}
              </p>
            </div>
          </div>

          {/* Twitter Content Target Block */}
          <div
            className={`relative flex h-full flex-col overflow-hidden rounded-3xl border-2 transition-all duration-300 ${
              selectedPlatforms.twitter
                ? "border-sky-500 bg-white shadow-[0_8px_30px_rgb(14,165,233,0.1)]"
                : "border-gray-200 bg-gray-50/50 opacity-60 backdrop-blur-sm grayscale-[0.8] hover:opacity-100"
            } p-6 sm:p-8`}
          >
            <div className="mb-6 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100/80 text-2xl">
                  🐦
                </div>
                <h2 className="text-xl font-bold tracking-tight text-gray-900">Twitter</h2>
              </div>
              <input
                type="checkbox"
                className="h-6 w-6 cursor-pointer rounded-md border-gray-300 text-sky-500 focus:ring-sky-500 transition"
                checked={selectedPlatforms.twitter}
                onChange={() => togglePlatform("twitter")}
              />
            </div>
            <div className="flex-1 whitespace-pre-wrap text-[15px] leading-relaxed text-gray-700">
              {data.twitter.content}
            </div>
            <div className="mt-8 border-t border-gray-100 pt-6">
              <p className="flex flex-wrap gap-2 text-sm font-semibold tracking-wide text-sky-500">
                {data.twitter.hashtags.map((tag: string, i: number) => (
                  <span key={i} className="rounded-md bg-sky-50 px-2 py-1">{tag.startsWith("#") ? tag : `#${tag}`}</span>
                ))}
              </p>
            </div>
          </div>

          {/* Telegram Content Target Block */}
          {(() => {
            const tgData = data.telegram || data.twitter;
            return (
              <div
                className={`relative flex h-full flex-col overflow-hidden rounded-3xl border-2 transition-all duration-300 ${
                  selectedPlatforms.telegram
                    ? "border-sky-400 bg-white shadow-[0_8px_30px_rgb(56,189,248,0.1)]"
                    : "border-gray-200 bg-gray-50/50 opacity-60 backdrop-blur-sm grayscale-[0.8] hover:opacity-100"
                } p-6 sm:p-8`}
              >
                <div className="mb-6 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100/90 text-2xl">
                      ✈️
                    </div>
                    <h2 className="text-xl font-bold tracking-tight text-gray-900">Telegram</h2>
                  </div>
                  <input
                    type="checkbox"
                    className="h-6 w-6 cursor-pointer rounded-md border-gray-300 text-sky-400 focus:ring-sky-400 transition"
                    checked={selectedPlatforms.telegram}
                    onChange={() => togglePlatform("telegram")}
                  />
                </div>
                <div className="flex-1 whitespace-pre-wrap text-[15px] leading-relaxed text-gray-700">
                  {tgData?.content}
                </div>
                <div className="mt-8 border-t border-gray-100 pt-6">
                  <p className="flex flex-wrap gap-2 text-sm font-semibold tracking-wide text-sky-400">
                    {tgData?.hashtags?.map((tag: string, i: number) => (
                      <span key={i} className="rounded-md bg-sky-50 px-2 py-1">{tag.startsWith("#") ? tag : `#${tag}`}</span>
                    ))}
                  </p>
                </div>
              </div>
            );
          })()}

        </div>

        {/* Global Explicit Action Intersections */}
        {!success && (
          <div className="flex flex-col items-center gap-6 border-t border-gray-200 pt-10">
            {selectedPlatforms.linkedin && isLinkedInConnected === false && (
              <a
                href="/api/auth/linkedin"
                className="inline-flex w-full max-w-md items-center justify-center gap-3 rounded-2xl border-2 border-blue-600 bg-blue-50 px-8 py-5 text-lg font-bold text-blue-700 shadow-sm transition hover:bg-blue-100 hover:-translate-y-1"
              >
                <span className="text-2xl">🔗</span> Connect LinkedIn Account
              </a>
            )}

            {selectedPlatforms.linkedin && isLinkedInConnected === true && (
              <div className="flex w-full max-w-md items-center justify-between rounded-2xl border-2 border-green-500 bg-green-50 px-6 py-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">✅</span>
                  <span className="font-semibold text-green-800">LinkedIn Connected</span>
                </div>
                <button
                  onClick={handleDisconnectLinkedIn}
                  disabled={disconnecting}
                  className="rounded-xl border border-red-300 bg-white px-4 py-2 text-sm font-bold text-red-600 shadow-sm transition hover:bg-red-50 hover:border-red-400 disabled:opacity-60"
                >
                  {disconnecting ? 'Disconnecting...' : 'Disconnect'}
                </button>
              </div>
            )}

            <button
              onClick={handlePublish}
              disabled={publishing || (selectedPlatforms.linkedin && isLinkedInConnected === false)}
              className="group relative flex w-full max-w-md items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gray-900 px-8 py-5 text-lg font-bold text-white shadow-2xl transition-all hover:-translate-y-1 hover:bg-gray-800 hover:shadow-[0_20px_40px_rgb(0,0,0,0.2)] focus:outline-none disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {publishing ? (
                <>
                  <svg className="h-6 w-6 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Publishing Active...</span>
                </>
              ) : (
                <span className="relative z-10 flex items-center gap-2">
                  <span className="text-xl">🚀</span> Approve and Publish
                </span>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
