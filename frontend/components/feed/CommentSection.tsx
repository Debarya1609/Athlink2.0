"use client";

import React, { useState } from 'react';

export function CommentSection() {
  const [expanded, setExpanded] = useState(false);

  if (!expanded) {
    return (
      <button 
        onClick={() => setExpanded(true)}
        className="text-[13px] font-semibold text-theme-slate hover:text-theme-cerulean transition-colors py-2 mt-2"
      >
        View comments
      </button>
    );
  }

  return (
    <div className="mt-4 pt-4 border-t border-theme-border">
      <div className="flex gap-3 mb-5">
        <div className="w-8 h-8 rounded-full bg-[#F0F2F5] flex-shrink-0 flex items-center justify-center text-xs text-theme-charcoal font-semibold border border-theme-border shadow-sm">
          S
        </div>
        <div className="bg-[#F8FAFC] rounded-xl p-4 flex-grow border border-theme-border">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="font-semibold text-[13px] text-theme-charcoal">Sam Alex</span>
            <span className="text-[11px] text-theme-slate font-medium">1h ago</span>
          </div>
          <p className="text-[13px] text-theme-charcoal mt-1">Great point! I totally agree with the approach you took here.</p>
          <div className="flex gap-4 mt-3">
            <button className="text-[11px] font-semibold text-theme-slate hover:text-theme-cerulean transition-colors">Like</button>
            <button className="text-[11px] font-semibold text-theme-slate hover:text-theme-cerulean transition-colors">Reply</button>
          </div>
        </div>
      </div>
      
      {/* Nested reply */}
      <div className="flex gap-3 mb-4 ml-8">
        <div className="w-8 h-8 rounded-full bg-[#F0F2F5] flex-shrink-0 flex items-center justify-center text-xs text-theme-charcoal font-semibold border border-theme-border shadow-sm">
          R
        </div>
        <div className="bg-[#F8FAFC] rounded-xl p-4 flex-grow border border-theme-border">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="font-semibold text-[13px] text-theme-charcoal">Ryan Dev</span>
            <span className="text-[11px] text-theme-slate font-medium">45m ago</span>
          </div>
          <p className="text-[13px] text-theme-charcoal mt-1">Thanks Sam! It was an interesting challenge.</p>
          <div className="flex gap-4 mt-3">
            <button className="text-[11px] font-semibold text-theme-slate hover:text-theme-cerulean transition-colors">Like</button>
            <button className="text-[11px] font-semibold text-theme-slate hover:text-theme-cerulean transition-colors">Reply</button>
          </div>
        </div>
      </div>

      <button 
        onClick={() => setExpanded(false)}
        className="text-[13px] font-semibold text-theme-slate hover:text-theme-charcoal transition-colors"
      >
        Hide comments
      </button>
    </div>
  );
}
