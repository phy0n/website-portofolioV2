import type { Metadata } from 'next';
import SiteShell from '@/components/home/SiteShell';
import ConnectTab from '@/components/home/tabs/ConnectTab';
import { getSiteProfile } from '@/lib/site-profile';

export const metadata: Metadata = {
  title: 'Connect',
  description: 'Social links, contact details, services, and testimonials.',
};

export default async function ConnectPage() {
  const { profileImageUrl } = await getSiteProfile();

  return (
    <SiteShell navAvatarSrc={profileImageUrl}>
      <section className="pt-10">
        <ConnectTab />
      </section>
    </SiteShell>
  );
}
