import React from 'react';

export default function RandomImageWidget() {
  return (
    <div className="w-full flex flex-col rounded-2xl bg-[#0a0a0a] border border-[#1e1f22] shadow-2xl overflow-hidden relative">
      <div className="w-full aspect-[4/5] relative overflow-hidden">
        <img
          src="/image/randompict.jpg"
          alt="Random Picture"
          className="w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-80 pointer-events-none"></div>
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2">
            <span className="text-white/80 text-xs font-semibold tracking-widest uppercase">Memory</span>
          </div>
        </div>
      </div>
    </div>
  );
}
