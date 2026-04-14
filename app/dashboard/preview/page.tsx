"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase";

interface PostData {
  content: string;
  hashtags: string[];
}

interface CampaignPreviewData {
  campaignId?: string;
  linkedin: PostData;
  instagram: PostData;
  twitter: PostData;
  telegram?: PostData;
}

type Platform = "linkedin" | "instagram" | "twitter" | "telegram";

function PreviewPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlCampaignId = searchParams.get('id');

  const [data, setData] = useState<CampaignPreviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isLinkedInConnected, setIsLinkedInConnected] = useState<boolean | null>(null);
  const [disconnecting, setDisconnecting] = useState(false);
  
  const [activeTab, setActiveTab] = useState<Platform>("linkedin");
  const [regenerating, setRegenerating] = useState<Platform | null>(null);

  const [selectedPlatforms, setSelectedPlatforms] = useState({
    linkedin: true,
    instagram: true,
    twitter: true,
    telegram: true,
  });

  useEffect(() => {
    async function loadData() {
      if (!urlCampaignId) {
        setLoading(false);
        return;
      }

      const supabase = createClient();
      
      const { data: posts, error } = await supabase
        .from('generated_posts')
        .select('*')
        .eq('campaign_id', urlCampaignId);
        
      if (!error && posts && posts.length > 0) {
        const newData: CampaignPreviewData = {
          campaignId: urlCampaignId,
          linkedin: { content: "", hashtags: [] },
          instagram: { content: "", hashtags: [] },
          twitter: { content: "", hashtags: [] },
          telegram: { content: "", hashtags: [] },
        };
        
        posts.forEach((p: any) => {
          if (newData[p.platform as Platform]) {
            newData[p.platform as Platform] = { content: p.content, hashtags: p.hashtags };
          }
        });
        
        setData(newData);
      }
      
      setLoading(false);
    }
    
    loadData();

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

  const togglePlatform = (platform: Platform) => {
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
      router.refresh(); 
      setIsLinkedInConnected(false);
    } catch (err) {
      console.error(err);
      alert('Failed to disconnect LinkedIn. Please try again.');
    } finally {
      setDisconnecting(false);
    }
  };

  const handlePublish = async () => {
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
    } catch (error) {
      console.error(error);
      alert("There was an unexpected error publishing your content natively. Please try again.");
    } finally {
      setPublishing(false);
    }
  };

  const handleRegenerate = async (platform: Platform) => {
    if (!data?.campaignId) {
        alert("No campaign ID found, please generate a new campaign first.");
        return;
    }
    
    setRegenerating(platform);
    
    try {
        const response = await fetch("/api/regenerate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                campaignId: data.campaignId,
                platform: platform,
            }),
        });
        
        if (!response.ok) {
            throw new Error("Failed to regenerate");
        }
        
        const result = await response.json();
        
        setData(prev => prev ? {
            ...prev,
            [platform]: {
               content: result.content || prev[platform]?.content || "",
               hashtags: result.hashtags || prev[platform]?.hashtags || [],
            }
        } : null);
        
    } catch (err) {
        console.error("Error regenerating", err);
        alert("Failed to regenerate the post.");
    } finally {
        setRegenerating(null);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[85vh] items-center justify-center bg-[#FDFDFD]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

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

  const tabsList: { id: Platform, label: string, icon: string, activeColor: string }[] = [
      { id: 'linkedin', label: 'LinkedIn', icon: '💼', activeColor: 'text-blue-700 border-blue-600 bg-blue-50/50' },
      { id: 'instagram', label: 'Instagram', icon: '📸', activeColor: 'text-pink-600 border-pink-500 bg-pink-50/50' },
      { id: 'twitter', label: 'Twitter', icon: '🐦', activeColor: 'text-gray-900 border-gray-900 bg-gray-100' },
      { id: 'telegram', label: 'Telegram', icon: '✈️', activeColor: 'text-sky-600 border-sky-400 bg-sky-50/50' },
  ];

  const renderCard = (platform: Platform) => {
    const postData = data?.[platform];
    if (!postData) return null;

    let safeHashtags: string[] = [];
    if (Array.isArray(postData.hashtags)) {
      safeHashtags = postData.hashtags;
    } else if (typeof postData.hashtags === "string") {
      safeHashtags = (postData.hashtags as string).split(/[,\s]+/).filter(Boolean);
    }

    const isSelected = selectedPlatforms[platform];

    return (
      <div className={`relative transition-all duration-300 w-full animate-in fade-in slide-in-from-bottom-4`}>
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl bg-gray-50 p-4 border border-gray-100">
           <div className="flex items-center gap-3">
             <input
                type="checkbox"
                id={`checkbox-${platform}`}
                className="h-6 w-6 cursor-pointer rounded-md border-gray-300 text-indigo-600 focus:ring-indigo-600 transition"
                checked={isSelected}
                onChange={() => togglePlatform(platform)}
             />
             <label htmlFor={`checkbox-${platform}`} className="font-semibold text-gray-700 cursor-pointer text-lg">Include {tabsList.find(t=>t.id===platform)?.label} in publishing</label>
           </div>
           
           <button 
             onClick={() => handleRegenerate(platform)}
             disabled={regenerating === platform}
             className="flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold shadow-sm border border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-700 hover:text-indigo-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
           >
             {regenerating === platform ? (
                 <svg className="h-5 w-5 animate-spin text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                 </svg>
             ) : (
                 "🔄 Regenerate this post"
             )}
           </button>
        </div>

        <div className={`${!isSelected ? 'opacity-50 grayscale-[0.6]' : 'opacity-100'} transition-all duration-300`}>
            {platform === 'linkedin' && (
               <div className="rounded-3xl border-t-8 border-t-[#0A66C2] border border-gray-200 bg-white p-8 sm:p-10 shadow-xl max-w-4xl mx-auto">
                 <div className="mb-8 flex items-center gap-4 border-b border-gray-100 pb-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-[#0A66C2] text-xl font-bold text-white shadow-sm">in</div>
                    <div>
                       <div className="font-extrabold text-gray-900 text-lg">LinkedIn Professional Post</div>
                       <div className="text-sm text-gray-500 font-medium">Thought Leadership • Networking</div>
                    </div>
                 </div>
                 <div className="whitespace-pre-wrap text-[16px] leading-relaxed text-gray-800 font-sans">
                   {postData.content}
                 </div>
                 <div className="mt-10 pt-6">
                     <p className="flex flex-wrap gap-2 text-[14px] font-semibold text-blue-700">
                       {safeHashtags.map((tag: string, i: number) => (
                         <span key={i} className="hover:underline cursor-pointer px-1">{tag.startsWith("#") ? tag : `#${tag}`}</span>
                       ))}
                     </p>
                 </div>
               </div>
            )}

            {platform === 'instagram' && (
               <div className="rounded-3xl bg-gradient-to-br from-[#fdf4ff] via-[#fdf2f8] to-[#fff1f2] border border-pink-200 p-8 sm:p-10 shadow-xl max-w-4xl mx-auto">
                 <div className="mb-8 flex items-center gap-4 border-b border-pink-100 pb-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-[#f09433] via-[#e6683c] to-[#bc1888] shadow-md text-xl text-white">📸</div>
                    <div>
                       <div className="font-extrabold text-gray-900 text-lg">Instagram Caption</div>
                       <div className="text-sm text-pink-700/80 font-medium">Visual Storytelling • Fun & Engaging</div>
                    </div>
                 </div>
                 <div className="whitespace-pre-wrap text-[17px] leading-relaxed text-gray-900 font-medium">
                   {postData.content}
                 </div>
                 <div className="mt-10 pt-6">
                     <p className="flex flex-wrap gap-2 text-[14px] font-bold">
                       {safeHashtags.map((tag: string, i: number) => (
                         <span key={i} className="rounded-full bg-gradient-to-r from-pink-100 to-purple-100 text-pink-800 px-4 py-1.5 shadow-sm border border-pink-200/50">{tag.startsWith("#") ? tag : `#${tag}`}</span>
                       ))}
                     </p>
                 </div>
               </div>
            )}

            {platform === 'twitter' && (
               <div className="rounded-3xl border border-sky-200 bg-[#F7FBFF] p-8 sm:p-10 shadow-lg max-w-4xl mx-auto">
                 <div className="mb-6 flex items-start gap-5">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-black text-2xl font-bold text-white shadow-md">𝕏</div>
                    <div className="w-full pt-1">
                       <div className="flex items-center gap-2 mb-4">
                           <span className="font-bold text-gray-900 text-lg hover:underline cursor-pointer">Your Account</span>
                           <span className="text-gray-500 font-medium text-sm">@username</span>
                       </div>
                       <div className="whitespace-pre-wrap text-[19px] leading-snug text-gray-900">
                           {postData.content}
                       </div>
                       <div className="mt-6">
                           <p className="flex flex-wrap gap-3 text-[16px] font-medium text-sky-500">
                             {safeHashtags.map((tag: string, i: number) => (
                               <span key={i} className="hover:underline cursor-pointer">{tag.startsWith("#") ? tag : `#${tag}`}</span>
                             ))}
                           </p>
                       </div>
                    </div>
                 </div>
               </div>
            )}

            {platform === 'telegram' && (
               <div className="rounded-3xl border border-gray-800 bg-[#0E1621] p-8 sm:p-10 shadow-2xl max-w-4xl mx-auto shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
                 <div className="mb-8 flex items-center justify-center bg-[#17212B] p-4 rounded-xl border border-gray-700 mx-auto max-w-sm shadow-inner">
                     <span className="text-white font-bold tracking-wide flex items-center gap-2">Telegram Channel <span className="text-xl">✈️</span></span>
                 </div>
                 <div className="flex flex-col">
                     <div className="bg-[#2B5278] text-white p-5 sm:p-6 rounded-[24px] rounded-tl-sm shadow-md w-full sm:w-[85%] whitespace-pre-wrap text-[16px] font-sans mx-auto mr-auto ml-0 border border-sky-900/30">
                       {postData.content}
                       
                       {safeHashtags.length > 0 && (
                           <div className="mt-5 pt-3 border-t border-sky-800/40">
                               <p className="flex flex-wrap gap-2 text-[15px] font-medium text-[#64B5EF]">
                                 {safeHashtags.map((tag: string, i: number) => (
                                   <span key={i} className="hover:text-white cursor-pointer transition">{tag.startsWith("#") ? tag : `#${tag}`}</span>
                                 ))}
                               </p>
                           </div>
                       )}
                       <div className="flex justify-end mt-2 items-center gap-1 opacity-60">
                           <span className="text-[11px] font-medium">10:42 AM</span>
                           <svg viewBox="0 0 16 15" width="16" height="15" className="fill-current text-[#A1C9DE]"><path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.32.32 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"/></svg>
                       </div>
                     </div>
                 </div>
               </div>
            )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[90vh] bg-[#FDFDFD] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-10 animate-in fade-in zoom-in-95 duration-500">
        
        <div className="space-y-4 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl">
            Review Your Generated Content
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-500">
            Preview, refine, and select your platforms below. Each piece of content is specifically crafted for its audience.
          </p>
        </div>

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

        <div className="mb-10">
          <div className="flex border-b-2 border-gray-100 overflow-x-auto no-scrollbar gap-2 max-w-4xl mx-auto px-2">
            {tabsList.map(tab => (
                <button
                   key={tab.id}
                   onClick={() => setActiveTab(tab.id)}
                   className={`flex 1 items-center justify-center gap-3 whitespace-nowrap px-6 py-4 text-[16px] font-bold transition-all border-b-[3px] -mb-[2px] rounded-t-xl ${
                      activeTab === tab.id
                        ? `${tab.activeColor}`
                        : 'border-transparent text-gray-400 hover:text-gray-700 hover:bg-gray-50'
                   }`}
                >
                    <span className="text-2xl drop-shadow-sm">{tab.icon}</span> {tab.label}
                </button>
            ))}
          </div>

          <div className="mt-8">
            {renderCard(activeTab)}
          </div>
        </div>

        {!success && (
          <div className="flex flex-col items-center gap-6 border-t border-gray-200 pt-10 max-w-3xl mx-auto">
            {activeTab === 'linkedin' && selectedPlatforms.linkedin && isLinkedInConnected === false && (
              <a
                href={`/api/auth/linkedin?campaignId=${urlCampaignId}`}
                className="inline-flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-blue-600 bg-blue-50 px-8 py-5 text-lg font-bold text-blue-700 shadow-sm transition hover:bg-blue-100 hover:-translate-y-1"
              >
                <span className="text-2xl">🔗</span> Connect LinkedIn Account
              </a>
            )}

            {activeTab === 'linkedin' && selectedPlatforms.linkedin && isLinkedInConnected === true && (
              <div className="flex w-full items-center justify-between rounded-2xl border-2 border-green-500 bg-green-50 px-6 py-4">
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
              className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gray-900 px-8 py-5 text-lg font-bold text-white shadow-xl transition-all hover:-translate-y-1 hover:bg-gray-800 hover:shadow-[0_20px_40px_rgb(0,0,0,0.2)] focus:outline-none disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
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
                  <span className="text-xl">🚀</span> Approve and Publish Matches
                </span>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PreviewPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[85vh] items-center justify-center bg-[#FDFDFD]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    }>
      <PreviewPageContent />
    </Suspense>
  );
}
