import React from "react";
import { Link } from "react-router-dom";
import { Award, Compass } from "lucide-react";

export default function Logo({ className = "" }) {
  return (
    <Link to="/" className={`px-5 py-4 flex items-center gap-3 border-b border-slate-100 hover:opacity-95 transition-opacity ${className}`}>
      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-700 via-blue-800 to-indigo-900 flex items-center justify-center text-white shadow-md shadow-blue-900/20">
        <Compass size={22} className="animate-spin-slow text-cyan-300" />
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className="font-extrabold text-base tracking-tight text-slate-900 font-sans">
            CAPACITY<span className="text-cyan-700 font-black">CONNECT</span>
          </span>
          <span className="bg-cyan-100 text-cyan-800 text-[10px] font-bold px-1.5 py-0.5 rounded">MoES</span>
        </div>
        <span className="text-[10px] text-slate-500 font-medium tracking-wide truncate max-w-[180px]">
          Digital Capacity Building Portal
        </span>
      </div>
    </Link>
  );
}