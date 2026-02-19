import HomeClient from '@/components/home/HomeClient';

export default function Page() {
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
      <HomeClient discordUserId={process.env.DISCORD_USER_ID ?? null} />
    </>
  );
}
