import { serviceRelations } from "./service-relations";
import { ServiceRelation } from "./types/service-relation";
import { ServiceType } from "./types/service-type";

const checkIsServiceAlreadySelected = (
  selectedServices: ServiceType[],
  candidateService: ServiceType
): boolean => {
  return selectedServices.includes(candidateService);
};

const getServiceRelations = (): ServiceRelation[] => {
  return serviceRelations;
};

const getServiceParentRelations = (
  candidateService: ServiceType
): ServiceRelation[] => {
  const serviceRelations = getServiceRelations();

  return serviceRelations.filter((relation) =>
    relation.relatedServices.includes(candidateService)
  );
};

const getServiceSubordinateRelations = (
  candidateService: ServiceType
): ServiceRelation[] => {
  const serviceRelations = getServiceRelations();

  return serviceRelations.filter((relation) =>
    relation.mainService.includes(candidateService)
  );
};

const checkIsServicePossibleToSelect = (
  selectedServices: ServiceType[],
  candidateService: ServiceType
): boolean => {
  const serviceParentRelations = getServiceParentRelations(candidateService);

  const isServiceSubordinateInRelation = !!serviceParentRelations.length;

  if (!isServiceSubordinateInRelation) {
    return true;
  }

  const parentServices = serviceParentRelations.map(
    (relation) => relation.mainService
  );

  return parentServices.some((parentService) =>
    selectedServices.includes(parentService)
  );
};

export const updateSelectedServicesHelper = {
  checkIsServiceAlreadySelected,
  checkIsServicePossibleToSelect,
  getServiceSubordinateRelations,
  getServiceParentRelations,
};
