import { getDashboardRecords } from "@/lib/data/records";

export default async function DashboardOverviewPage() {
  const records = await getDashboardRecords(8, 0);
  const metrics = [
    { label: "Total records loaded", value: String(records.length) },
    { label: "Public ready", value: String(records.filter((record) => record.is_public).length) },
    { label: "Needs review", value: String(records.filter((record) => record.status === "Needs Review").length) },
    { label: "Textiles", value: String(records.filter((record) => record.record_type === "Textile").length) }
  ];

  return (
    <>
      <section className="panel">
        <p className="eyebrow">Dashboard</p>
        <h1 className="pageTitle">Collections operations overview</h1>
        <p className="muted">
          This is the private dashboard shell. In the migration, overview cards, assignments, import queues, and workflow
          alerts would live here.
        </p>
      </section>
      <section className="metricStrip">
        {metrics.map((metric) => (
          <article key={metric.label} className="metricCard">
            <span className="eyebrow">{metric.label}</span>
            <strong>{metric.value}</strong>
          </article>
        ))}
      </section>
    </>
  );
}
