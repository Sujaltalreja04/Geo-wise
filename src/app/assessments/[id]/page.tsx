import { AssessmentDetailModule } from "@/components/modules/assessment-detail-module";

export const metadata = {
  title: "Assessment Findings & Evidence — GeoWise",
  description: "Detailed spatial assessment findings, measurements, data gaps, and evidence.",
};

export default async function AssessmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl">
      <AssessmentDetailModule initialId={id} />
    </div>
  );
}
