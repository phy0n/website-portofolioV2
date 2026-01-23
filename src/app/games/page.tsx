import SiteShell from '@/components/home/SiteShell';
import GamesPageClient from '@/components/home/GamesPageClient';

export default function GamesPage() {
  return (
    <SiteShell>
      <section className="pt-10">
        <GamesPageClient />
      </section>
    </SiteShell>
  );
}
