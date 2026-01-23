import SiteShell from '@/components/home/SiteShell';
import ConnectTab from '@/components/home/tabs/ConnectTab';

export default function ConnectPage() {
  return (
    <SiteShell>
      <section className="pt-10">
        <ConnectTab />
      </section>
    </SiteShell>
  );
}
