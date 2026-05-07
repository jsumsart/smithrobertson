import { getDashboardRecords } from "@/lib/data/records";

export default async function DashboardRecordsPage() {
  const records = await getDashboardRecords(25, 0);

  return (
    <>
      <section className="panel">
        <p className="eyebrow">Records</p>
        <h1 className="pageTitle">Server-rendered records table</h1>
        <p className="muted">
          This route demonstrates the future direction: paginated, server-driven record queries instead of loading the
          whole collection into a static page.
        </p>
      </section>
      <section className="panel">
        <table className="tableLike">
          <thead>
            <tr>
              <th>Accession</th>
              <th>Title</th>
              <th>Type</th>
              <th>Status</th>
              <th>Geography</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.id}>
                <td>{record.accession_number}</td>
                <td>{record.title}</td>
                <td>{record.record_type}</td>
                <td>{record.status}</td>
                <td>{record.neighborhood || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
