"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type GoalType = "Hiring" | "Lead Generation" | "Branding" | "Announcement" | null;

const GOALS: { id: GoalType; title: string; description: string; icon: string }[] = [
  {
    id: "Hiring",
    title: "Hiring",
    description: "Attract top talent and grow your dream team",
    icon: "🤝",
  },
  {
    id: "Lead Generation",
    title: "Lead Generation",
    description: "Drive sales and acquire high-quality prospects",
    icon: "📈",
  },
  {
    id: "Branding",
    title: "Branding",
    description: "Build awareness and establish thought leadership",
    icon: "✨",
  },
  {
    id: "Announcement",
    title: "Announcement",
    description: "Share news, milestones, or product launches",
    icon: "📢",
  },
];

export default function NewCampaignPage() {
  const router = useRouter();
  const [selectedGoal, setSelectedGoal] = useState<GoalType>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedGoal) return;

    setIsGenerating(true);

    // Extract dynamic form inputs automatically using standard React Form DOM bindings
    const formElement = e.currentTarget;
    const dataObj = new FormData(formElement);
    const formDataPayload: Record<string, string> = {};
    dataObj.forEach((value, key) => {
      formDataPayload[key] = value.toString();
    });

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal: selectedGoal,
          formData: formDataPayload,
        }),
      });

      if (!response.ok) {
         const err = await response.json();
         throw new Error(err.error || "Generation endpoint failed");
      }

      const generatedData = await response.json();

      // Store the preview JSON output payload into localStorage 
      // dynamically mapping the handshake across pages without complex state managers.
      localStorage.setItem("generatedCampaignPreview", JSON.stringify(generatedData));

      // Route the user to the preview UI
      router.push("/dashboard/preview");
      
    } catch (error: any) {
      console.error(error);
      alert("There was an error generating your campaign API. Error: " + error.message);
      setIsGenerating(false);
    }
  };

  const renderForm = () => {
    switch (selectedGoal) {
      case "Hiring":
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Job Title</label>
                <input
                  type="text"
                  name="jobTitle"
                  required
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-3 text-sm outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 placeholder:text-gray-400"
                  placeholder="e.g., Senior Frontend Developer"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Location</label>
                <input
                  type="text"
                  name="location"
                  required
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-3 text-sm outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 placeholder:text-gray-400"
                  placeholder="e.g., San Francisco, CA"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Salary Range</label>
                <input
                  type="text"
                  name="salaryRange"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-3 text-sm outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 placeholder:text-gray-400"
                  placeholder="e.g., $120k - $150k"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Work Model</label>
                <select name="workModel" className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-3 text-sm outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10">
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="On-site">On-site</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Required Skills</label>
              <textarea
                name="requiredSkills"
                rows={3}
                required
                className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50/50 p-3 text-sm outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 placeholder:text-gray-400"
                placeholder="List the key skills and qualifications..."
              ></textarea>
            </div>
          </div>
        );
      case "Lead Generation":
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Service Offered</label>
                <input
                  type="text"
                  name="serviceOffered"
                  required
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-3 text-sm outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 placeholder:text-gray-400"
                  placeholder="What are you selling?"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Target Industry</label>
                <input
                  type="text"
                  name="targetIndustry"
                  required
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-3 text-sm outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 placeholder:text-gray-400"
                  placeholder="Who is this for?"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Key USP (Unique Selling Proposition)</label>
              <textarea
                name="keyUSP"
                rows={3}
                required
                className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50/50 p-3 text-sm outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 placeholder:text-gray-400"
                placeholder="Why should they choose you over competitors?"
              ></textarea>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Call to Action <span className="font-normal text-gray-400">(CTA)</span></label>
              <input
                type="text"
                name="callToAction"
                required
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-3 text-sm outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 placeholder:text-gray-400"
                placeholder="e.g., Book a Free Consultation"
              />
            </div>
          </div>
        );
      case "Branding":
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Brand Tone</label>
              <input
                type="text"
                name="brandTone"
                required
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-3 text-sm outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 placeholder:text-gray-400"
                placeholder="e.g., Professional, Authoritative, Witty, or Empathetic"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Tagline / Core Value</label>
              <input
                type="text"
                name="tagline"
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-3 text-sm outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 placeholder:text-gray-400"
                placeholder="e.g., Innovating the future of AI"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Event or Context</label>
              <textarea
                name="eventContext"
                rows={4}
                required
                className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50/50 p-3 text-sm outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 placeholder:text-gray-400"
                placeholder="What is the context of this post? Describe your brand's recent milestone, perspective, or thoughts..."
              ></textarea>
            </div>
          </div>
        );
      case "Announcement":
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">What are you announcing?</label>
              <input
                type="text"
                name="announcementDetails"
                required
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-3 text-sm outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 placeholder:text-gray-400"
                placeholder="e.g., Series B Funding, New Feature Launch, Partnership"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Target Audience</label>
              <input
                type="text"
                name="targetAudience"
                required
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-3 text-sm outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 placeholder:text-gray-400"
                placeholder="Who needs to hear this? e.g., Investors, Existing users"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Key Details</label>
              <textarea
                name="keyDetails"
                rows={4}
                required
                className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50/50 p-3 text-sm outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 placeholder:text-gray-400"
                placeholder="The important facts, dates, numbers, or links associated with this news..."
              ></textarea>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-12">
        
        {/* Page Header Section */}
        <div className="space-y-3 text-center animate-in fade-in zoom-in-95 duration-500">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            Create New Campaign
          </h1>
          <p className="mx-auto max-w-xl text-lg text-gray-500">
            Define your goal to generate highly converting copy instantly.
          </p>
        </div>

        {/* Campaign Goal Selection UI */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-800">1. Select your primary goal</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {GOALS.map((goal) => {
              const isSelected = selectedGoal === goal.id;
              return (
                <button
                  key={goal.id}
                  type="button"
                  onClick={() => setSelectedGoal(goal.id)}
                  className={`group flex flex-col items-start space-y-3 rounded-2xl border p-5 text-left transition-all duration-300 ${
                    isSelected
                      ? "border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600 ring-offset-2 md:scale-[1.02] shadow-sm"
                      : "border-gray-200 bg-white hover:border-indigo-300 hover:bg-gray-50 hover:shadow-md"
                  }`}
                >
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full text-2xl transition-colors ${
                      isSelected ? "bg-indigo-600 text-white shadow-inner" : "bg-gray-100 text-gray-600 group-hover:bg-indigo-100"
                    }`}
                  >
                    {goal.icon}
                  </div>
                  <div>
                    <h3
                      className={`font-bold transition-colors ${
                        isSelected ? "text-indigo-900" : "text-gray-900"
                      }`}
                    >
                      {goal.title}
                    </h3>
                    <p
                      className={`mt-1 text-xs transition-colors ${
                        isSelected ? "text-indigo-700" : "text-gray-500"
                      }`}
                    >
                      {goal.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Real-time Dynamic Form Generation Area */}
        <div
          className={`overflow-hidden transition-all duration-700 ease-in-out ${
            selectedGoal ? "max-h-[1200px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          {selectedGoal && (
            <div className="rounded-3xl border border-gray-100 bg-white p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <h2 className="mb-6 text-2xl font-bold text-gray-900 border-b border-gray-100 pb-4">
                2. Details for <span className="text-indigo-600">{selectedGoal}</span>
              </h2>
              
              <form onSubmit={handleGenerate} className="space-y-8">
                {renderForm()}
                
                <div className="pt-4 flex justify-end items-center border-t border-gray-100 mt-6 pt-6">
                  <button
                    type="submit"
                    disabled={isGenerating}
                    className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gray-900 px-8 py-4 text-sm font-semibold text-white transition-all hover:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-gray-300 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto shadow-xl"
                  >
                    {isGenerating ? (
                      <>
                        <svg className="h-5 w-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Generating...</span>
                      </>
                    ) : (
                      <span className="relative z-10 flex items-center gap-2">
                        ✨ Generate Content
                      </span>
                    )}
                    {!isGenerating && (
                      <div className="absolute inset-0 z-0 h-full w-full bg-gradient-to-r from-indigo-500 to-purple-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
