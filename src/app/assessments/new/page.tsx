import { NewAssessmentWizard } from "@/components/modules/new-assessment-wizard";

export const metadata = {
  title: "New Site Assessment — GeoWise",
  description: "Register and validate a proposed property development site for geospatial analysis.",
};

export default function NewAssessmentPage() {
  return (
    <div className="container mx-auto p-4 md:p-6 max-w-5xl">
      <NewAssessmentWizard />
    </div>
  );
}
