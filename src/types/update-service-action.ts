import { ServiceType } from "./service-type";

export type UpdateServiceActionType = "Select" | "Deselect";

export type UpdateServiceAction = {
  type: UpdateServiceActionType;
  service: ServiceType;
};
