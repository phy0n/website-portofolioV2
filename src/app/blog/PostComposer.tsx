import { createPost } from './postActions';

export default function PostComposer() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-sm font-semibold text-white">Create Post</h2>
        <p className="text-[10px] uppercase tracking-[0.35em] text-white/40">Admin</p>
      </div>

      <div className="rounded-3xl border border-white/10 bg-black/30 p-6">
        <form action={createPost} encType="multipart/form-data" className="space-y-4">
          <textarea
            name="content"
            placeholder="Write something… (leave empty if you upload an image)"
            rows={4}
            className="w-full resize-none rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/20"
            maxLength={2000}
          />

          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">Image (optional)</p>
            <input
              type="file"
              name="image_file"
              accept="image/png,image/jpeg,image/webp"
              className="block w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white file:mr-4 file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white"
            />
            <p className="text-xs text-white/40">PNG/JPG/WebP, max 5MB.</p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <label className="inline-flex items-center gap-2 text-xs text-white/70">
              <input
                type="checkbox"
                name="show_on_main"
                value="true"
                defaultChecked
                className="h-4 w-4 rounded border-white/20 bg-black/40"
              />
              Show on Main
            </label>
            <label className="inline-flex items-center gap-2 text-xs text-white/70">
              <input
                type="checkbox"
                name="show_on_phion"
                value="true"
                defaultChecked
                className="h-4 w-4 rounded border-white/20 bg-black/40"
              />
              Show on Phion
            </label>
          </div>

          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-semibold text-white hover:border-white/20 hover:bg-white/[0.08]"
          >
            Post
          </button>
        </form>
      </div>
    </div>
  );
}
