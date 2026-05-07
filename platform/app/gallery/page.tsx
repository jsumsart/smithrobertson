import { getPublicRecords } from "@/lib/data/records";
import { getSiteSettings } from "@/lib/data/site";
import { PublicSiteHeader } from "@/components/public-site-header";

export default async function GalleryPage() {
  const settings = await getSiteSettings();
  const records = await getPublicRecords(12);

  return (
    <div className="pageWrap">
      <PublicSiteHeader brandName={settings.brand_name} />
      <section className="heroPanel">
        <p className="eyebrow">Digital Gallery</p>
        <h1 className="pageTitle">{settings.public_gallery_title}</h1>
        <p className="muted">{settings.public_gallery_intro}</p>
      </section>
      <section className="recordGrid">
        {records.map((record) => (
          <article key={record.id} className="recordCard">
            <p className="eyebrow">{record.record_type}</p>
            <h3>{record.title}</h3>
            <p className="muted">{record.description || "No description yet."}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
