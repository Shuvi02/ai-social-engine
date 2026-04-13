"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

// Safely typed representation referencing active Database rows 
interface Campaign {
  id: string;
  goal: string;
  status?: string;
  created_at: string;
}

export default function HistoryPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Properly initialize the browser client mapped inside component hooks isolating SSR loops cleanly 
  const supabase = createClient();

  useEffect(() => {
    async function fetchCampaignHistory() {
      // Secure local memory state and effectively verify authentic login
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        // Kick explicitly to login boundaries preventing phantom execution
        router.push("/login");
        return;
      }

      // Read natively against Supabase mapping table sorted intelligently
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase Database synchronization explicitly failed fetching arrays:", error);
      } else if (data) {
        setCampaigns(data);
      }

      setLoading(false);
    }

    fetchCampaignHistory();
  }, [router, supabase]);

  // Utility logic injecting interactive visual queues parsing database string maps
  const getStatusBadge = (status?: string) => {
    const renderStatus = status ? status.toLowerCase() : "generated";
    
    if (renderStatus === "published") {
      return (
        <span className="inline-flex whitespace-nowrap items-center rounded-full bg-green-50 px-2.5 py-1 text-xs font-bold text-green-700 ring-1 ring-inset ring-green-600/20 shadow-sm shadow-green-100">
          Published
        </span>
      );
    }
    return (
      <span className="inline-flex whitespace-nowrap items-center rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700 ring-1 ring-inset ring-indigo-700/10 shadow-sm shadow-indigo-100">
        Generated Artifact
      </span>
    );
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;
    
    setDeletingId(id);
    try {
      const res = await fetch(`/api/campaigns/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed.');
      
      setCampaigns(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete the campaign. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[75vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent shadow-lg text-center"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-10 animate-in fade-in zoom-in-95 duration-500">
        
        {/* Upper Title Navigation Container */}
        <div className="sm:flex sm:items-center sm:justify-between border-b border-gray-100 pb-6">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">Campaign History</h1>
            <p className="mt-2 text-lg text-gray-500">
              Browse securely through your previously generated AI social media layouts.
            </p>
          </div>
          <div className="mt-6 sm:mt-0 sm:flex-none">
            <button
              onClick={() => router.push("/dashboard/new")}
              type="button"
              className="inline-flex shadow-xl hover:-translate-y-1 transition duration-300 items-center justify-center rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              <span className="mr-2">✨</span> Create New Campaign
            </button>
          </div>
        </div>

        {/* Mapped Container Block Representing Full Table Configuration */}
        <div className="flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm ring-1 ring-black ring-opacity-5">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th scope="col" className="py-5 pl-6 pr-3 text-left text-sm font-bold text-gray-900 tracking-wide uppercase">
                        Goal Focus
                      </th>
                      <th scope="col" className="px-3 py-5 text-left text-sm font-bold text-gray-900 tracking-wide uppercase">
                        Created Date
                      </th>
                      <th scope="col" className="px-3 py-5 text-left text-sm font-bold text-gray-900 tracking-wide uppercase">
                        Status Context
                      </th>
                      <th scope="col" className="relative py-5 pl-3 pr-6 sm:pr-8">
                        <span className="sr-only">View</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {campaigns.length > 0 ? (
                      campaigns.map((campaign) => (
                        <tr key={campaign.id} className="transition-colors hover:bg-gray-50/80">
                          <td className="whitespace-nowrap py-6 pl-6 pr-3 text-sm font-bold text-gray-900 max-w-xs truncate">
                            {campaign.goal}
                          </td>
                          <td className="whitespace-nowrap px-3 py-6 text-sm text-gray-600">
                            {new Date(campaign.created_at).toLocaleDateString("en-US", {
                              weekday: "short",
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </td>
                          <td className="whitespace-nowrap px-3 py-6 text-sm">
                            {getStatusBadge(campaign.status)}
                          </td>
                          <td className="relative whitespace-nowrap py-6 pl-3 pr-6 text-right text-sm font-medium sm:pr-8">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => router.push(`/dashboard/preview?id=${campaign.id}`)}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 font-bold text-indigo-600 shadow-sm border border-indigo-100 hover:bg-indigo-50 hover:text-indigo-900 transition-colors"
                              >
                                View Project <span>&rarr;</span>
                              </button>
                              <button
                                onClick={() => handleDelete(campaign.id)}
                                disabled={deletingId === campaign.id}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 font-bold text-red-600 shadow-sm border border-red-100 hover:bg-red-50 hover:text-red-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Delete Campaign"
                              >
                                {deletingId === campaign.id ? 'Wait...' : 'Delete'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-24 text-center">
                          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50 text-3xl mb-4">
                            📁
                          </span>
                          <p className="text-xl font-bold text-gray-900">No campaigns found</p>
                          <p className="mt-2 text-gray-500 tracking-wide">Looks like you haven't started generating artifacts yet.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
