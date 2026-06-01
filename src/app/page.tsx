import fs from 'fs';
import path from 'path';
import HomeClient from '@/components/home/HomeClient';
import { getSiteProfile } from '@/lib/site-profile';

function getTools() {
  try {
    const dir = path.join(process.cwd(), 'public/image/tools_languange');
    const files = fs.readdirSync(dir);
    return files
      .filter((file) => file.endsWith('.png'))
      .sort((a, b) => {
        const numA = parseInt(a.match(/^[0-9]+/)?.[0] || '0', 10);
        const numB = parseInt(b.match(/^[0-9]+/)?.[0] || '0', 10);
        return numA - numB;
      });
  } catch (error) {
    return [];
  }
}

export default async function Page() {
  const { profileImageUrl } = await getSiteProfile();
  const tools = getTools();

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'Phion Rushandle',
      alternateName: 'Phy0n',
      jobTitle: 'Web Developer',
      url: 'https://phy0n.my.id/',
      sameAs: [
        'https://www.instagram.com/rushandle/',
        'https://www.tiktok.com/@phy0n',
        'https://discord.gg/MwNE7Vfb6t',
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Phy0n Portfolio',
      url: 'https://phy0n.my.id/',
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <HomeClient
        discordUserId={process.env.DISCORD_USER_ID ?? null}
        profileImageUrl={profileImageUrl}
        tools={tools}
      />
    </>
  );
}
