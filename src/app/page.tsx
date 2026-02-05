import HomeClient from '@/components/home/HomeClient';

export default function Page() {
  return <HomeClient discordUserId={process.env.DISCORD_USER_ID ?? null} />;
}
