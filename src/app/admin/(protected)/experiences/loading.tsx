export default function AdminLoading() {
  return (
    <div className="w-full flex items-center justify-center min-h-[50vh] font-manrope animate-in fade-in duration-500">
      <div className="flex flex-col items-center gap-4">
        <div className="h-5 w-5 rounded-full border border-white/20 border-t-white animate-spin" />
        <p className="text-[10px] font-geist-mono uppercase tracking-[0.25em] text-white/30">Accessing Data...</p>
      </div>
    </div>
  );
}
