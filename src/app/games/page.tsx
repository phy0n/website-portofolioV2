import SiteShell from '@/components/home/SiteShell';
import GamesPageClient from '@/components/home/GamesPageClient';
import { getSiteProfile } from '@/lib/site-profile';

export default async function GamesPage() {
  const { profileImageUrl } = await getSiteProfile();

  return (
    <SiteShell navAvatarSrc={profileImageUrl}>
      <section className="pt-10">
        <GamesPageClient />
      </section>
    </SiteShell>
  );
}
