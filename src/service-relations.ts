import { ServiceRelation } from "./types/service-relation";

export const serviceRelations: ServiceRelation[] = [
  {
    mainService: "VideoRecording",
    relatedServices: ["BlurayPackage", "TwoDayEvent"],
  },
  {
    mainService: "Photography",
    relatedServices: ["TwoDayEvent"],
  },
];
