import { ServiceType } from "./service-type";

export type ServiceRelation = {
  mainService: ServiceType;
  relatedServices: ServiceType[];
};
