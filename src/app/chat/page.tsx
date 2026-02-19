import type { Metadata } from 'next';
import ChatPageClient from '@/components/chat/ChatPageClient';
import SiteShell from '@/components/home/SiteShell';

export const metadata: Metadata = {
  title: 'Chat',
  description: 'Public chat room for viewers and the author.',
};

export default function ChatPage() {
  return (
    <SiteShell>
      <section className="pt-10">
        <ChatPageClient />
      </section>
    </SiteShell>
  );
}
