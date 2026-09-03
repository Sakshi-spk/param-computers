import { Sparkles } from "lucide-react";

export default function AnnouncementBar() {
  return (
    <div className="relative z-[60] w-full bg-[#0F2B5B] text-white">
      <div className="mx-auto flex min-h-[38px] w-full max-w-7xl items-center justify-center px-4 py-2 text-center sm:px-6">
        <div className="flex items-center justify-center gap-2 text-xs font-medium sm:text-sm">
          <Sparkles
            size={15}
            className="shrink-0 text-[#C6922F]"
          />

          <span>
            Premium Technology Solutions for Businesses, Schools & Institutions
          </span>
        </div>
      </div>
    </div>
  );
}