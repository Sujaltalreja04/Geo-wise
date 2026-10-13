import { AssessmentsListModule } from "@/components/modules/assessments-list-module";

export const metadata = {
  title: "Site Assessments — GeoWise",
  description: "Browse and review geospatial development site assessments.",
};

export default function AssessmentsPage() {
  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl">
      <AssessmentsListModule />
    </div>
  );
}
