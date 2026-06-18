import React from "react";
import { useAppSelector } from "../store/hooks";

const GlobalLoader: React.FC = () => {
  const loading = useAppSelector((state) => state.ui.loading);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-950/65 backdrop-blur-md transition-all duration-300">
      <div className="relative flex items-center justify-center">
        {/* Outer glowing animated border */}
        <div className="w-20 h-20 rounded-full border-4 border-slate-900 border-t-purple-600 animate-spin absolute" />
        {/* Inner reverse rotating glowing border */}
        <div className="w-16 h-16 rounded-full border-4 border-slate-900 border-b-indigo-500 animate-spin absolute" style={{ animationDirection: "reverse", animationDuration: "1s" }} />
      </div>
      <span className="mt-8 text-sm font-semibold tracking-wider text-slate-200 animate-pulse">
        Loading data...
      </span>
    </div>
  );
};

export default GlobalLoader;
