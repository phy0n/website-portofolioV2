import { createPost } from './postActions';

export default function PostComposer() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-sm font-semibold text-[var(--home-ink)]">Create Post</h2>
        <p className="text-[10px] uppercase tracking-[0.35em] text-[var(--home-muted)] opacity-40">Admin</p>
      </div>

      <div className="rounded-3xl border border-[var(--home-border)] bg-[var(--home-card)] p-6">
        <form action={createPost} className="space-y-4">
          <textarea
            name="content"
            placeholder="Write something… (leave empty if you upload an image)"
            rows={4}
            className="w-full resize-none rounded-2xl border border-[var(--home-border)] bg-[var(--home-card)] px-4 py-3 text-sm text-[var(--home-ink)] placeholder:text-[var(--home-muted)] opacity-30 outline-none focus:border-[var(--home-border)]"
            maxLength={2000}/>

          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--home-muted)] opacity-40">Image (optional)</p>
            <input
              type="file"
              name="image_file"
              accept="image/png,image/jpeg,image/webp"
              className="block w-full rounded-2xl border border-[var(--home-border)] bg-[var(--home-card)] px-4 py-3 text-sm text-[var(--home-ink)] file:mr-4 file:rounded-full file:border-0 file:bg-[var(--home-soft)] file:px-4 file:py-2 file:text-xs file:font-semibold file:text-[var(--home-ink)]"/>
            <p className="text-xs text-[var(--home-muted)] opacity-40">PNG/JPG/WebP, max 5MB.</p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <label className="inline-flex items-center gap-2 text-xs text-[var(--home-ink)] opacity-70">
              <input
                type="checkbox"
                name="show_on_main"
                value="true"
                defaultChecked
                className="h-4 w-4 rounded border-[var(--home-border)] bg-[var(--home-card)]"/>
              Show on Main
            </label>
            <label className="inline-flex items-center gap-2 text-xs text-[var(--home-ink)] opacity-70">
              <input
                type="checkbox"
                name="show_on_phion"
                value="true"
                defaultChecked
                className="h-4 w-4 rounded border-[var(--home-border)] bg-[var(--home-card)]"/>
              Show on Phion
            </label>
          </div>

          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-2xl border border-[var(--home-border)] bg-[var(--home-soft)] px-4 py-3 text-sm font-semibold text-[var(--home-ink)] hover:border-[var(--home-border)] hover:bg-[var(--home-soft)]">
            Post
          </button>
        </form>
      </div>
    </div>
  );
}
