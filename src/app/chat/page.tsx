import type { Metadata } from 'next';
import ChatPageClient from '@/components/chat/ChatPageClient';
import SiteShell from '@/components/home/SiteShell';
import { getSiteProfile } from '@/lib/site-profile';

export const metadata: Metadata = {
  title: 'Chat',
  description: 'Public chat room for viewers and the author.',
};

export default async function ChatPage() {
  const { profileImageUrl } = await getSiteProfile();

  return (
    <SiteShell navAvatarSrc={profileImageUrl}>
      <section className="pt-10">
        <ChatPageClient />
      </section>
    </SiteShell>
  );
}
