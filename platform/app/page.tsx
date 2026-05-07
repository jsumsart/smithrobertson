import Link from "next/link";
import { getSiteSettings } from "@/lib/data/site";
import { PublicSiteHeader } from "@/components/public-site-header";

export default async function HomePage() {
  const settings = await getSiteSettings();

  return (
    <div className="pageWrap">
      <PublicSiteHeader brandName={settings.brand_name} />
      <section className="heroPanel">
        <p className="eyebrow">Public Museum Site</p>
        <h1 className="heroTitle">{settings.public_gallery_title}</h1>
        <p className="muted">{settings.public_gallery_intro}</p>
        <div className="buttonRow">
          <Link href="/gallery" className="buttonPrimary">
            Open Digital Gallery
          </Link>
          <Link href="/archive" className="buttonSecondary">
            Search Archive
          </Link>
        </div>
      </section>
    </div>
  );
}
