import { getPublicRecords } from "@/lib/data/records";
import { getSiteSettings } from "@/lib/data/site";
import { PublicSiteHeader } from "@/components/public-site-header";

export default async function ArchivePage() {
  const settings = await getSiteSettings();
  const records = await getPublicRecords(24);

  return (
    <div className="pageWrap">
      <PublicSiteHeader brandName={settings.brand_name} />
      <section className="panel">
        <p className="eyebrow">Archive</p>
        <h1 className="pageTitle">{settings.public_catalog_title}</h1>
        <p className="muted">{settings.public_catalog_intro}</p>
      </section>
      <section className="panel">
        <table className="tableLike">
          <thead>
            <tr>
              <th>Accession</th>
              <th>Title</th>
              <th>Type</th>
              <th>Theme</th>
              <th>Geography</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.id}>
                <td>{record.accession_number}</td>
                <td>{record.title}</td>
                <td>{record.record_type}</td>
                <td>{record.historical_theme || "—"}</td>
                <td>{record.neighborhood || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
