import { pricingCalculatorHelper } from "./pricing-calculator.helper";
import { PriceCalculationResult } from "./types/price-calculation-result";
import { ServicePricingItem } from "./types/service-pricing";
import { ServiceRelation } from "./types/service-relation";
import { ServiceType } from "./types/service-type";
import { ServiceYear } from "./types/service-year";
import { UpdateServiceAction } from "./types/update-service-action";
import { updateSelectedServicesHelper } from "./update-selected-services.helper";

const selectService = (
  previouslySelectedServices: ServiceType[],
  newService: ServiceType
) => {
  const isServiceAlreadySelected =
    updateSelectedServicesHelper.checkIsServiceAlreadySelected(
      previouslySelectedServices,
      newService
    );

  if (isServiceAlreadySelected) {
    return [...previouslySelectedServices];
  }

  const isServicePossibleToSelect =
    updateSelectedServicesHelper.checkIsServicePossibleToSelect(
      previouslySelectedServices,
      newService
    );

  if (!isServicePossibleToSelect) {
    return [...previouslySelectedServices];
  }

  return [...previouslySelectedServices, newService];
};

const getServicesToDeleteFromRelation = (
  previouslySelectedServices: ServiceType[],
  relation: ServiceRelation,
  serviceCandidateToDelete: ServiceType
): ServiceType[] => {
  const nextServicesToDelete: ServiceType[] = [];

  relation.relatedServices.forEach((relatedService) => {
    const relatedServiceRelations =
      updateSelectedServicesHelper.getServiceParentRelations(relatedService);

    const isTheOnlyRelation = relatedServiceRelations.length === 1;

    if (isTheOnlyRelation) {
      return;
    }

    const otherRelatedServiceRelations = relatedServiceRelations.filter(
      (relation) => relation.mainService !== serviceCandidateToDelete
    );

    const isAnyRelatedServiceRelationParentSelected =
      otherRelatedServiceRelations.some((relation) =>
        updateSelectedServicesHelper.checkIsServiceAlreadySelected(
          previouslySelectedServices,
          relation.mainService
        )
      );

    if (isAnyRelatedServiceRelationParentSelected) {
      return;
    }

    nextServicesToDelete.push(relatedService);
  });

  return nextServicesToDelete;
};

const deselectServiceWhileServiceInRelations = (
  previouslySelectedServices: ServiceType[],
  serviceCandidateToDelete: ServiceType,
  serviceSubordinateRelations: ServiceRelation[]
) => {
  let servicesToDelete: ServiceType[] = [serviceCandidateToDelete];

  serviceSubordinateRelations.forEach((relation) => {
    const servicesToDeleteFromRelation = getServicesToDeleteFromRelation(
      previouslySelectedServices,
      relation,
      serviceCandidateToDelete
    );
    servicesToDelete = [...servicesToDelete, ...servicesToDeleteFromRelation];
  });

  return previouslySelectedServices.filter(
    (prevSelectedService) => !servicesToDelete.includes(prevSelectedService)
  );
};

const deselectService = (
  previouslySelectedServices: ServiceType[],
  serviceCandidateToDelete: ServiceType
): ServiceType[] => {
  const serviceSubordinateRelations =
    updateSelectedServicesHelper.getServiceSubordinateRelations(
      serviceCandidateToDelete
    );

  const isServiceParentInRelation = !!serviceSubordinateRelations.length;

  if (isServiceParentInRelation) {
    return deselectServiceWhileServiceInRelations(
      previouslySelectedServices,
      serviceCandidateToDelete,
      serviceSubordinateRelations
    );
  }

  return previouslySelectedServices.filter(
    (prevSelectedService) => prevSelectedService !== serviceCandidateToDelete
  );
};

export const updateSelectedServices = (
  previouslySelectedServices: ServiceType[],
  action: UpdateServiceAction
): ServiceType[] => {
  switch (action.type) {
    case "Select":
      return selectService(previouslySelectedServices, action.service);
    case "Deselect":
      return deselectService(previouslySelectedServices, action.service);
  }
};

const calculatePricingItem = (
  packagePricingItem: ServicePricingItem,
  selectedServices: ServiceType[],
  selectedYear: ServiceYear
): {
  calculatedServices: ServiceType[];
} & PriceCalculationResult => {
  const servicesBasePrice = pricingCalculatorHelper.getServiceBasePrice(
    packagePricingItem.services,
    selectedYear,
    selectedServices
  );

  const servicesPriceConsideringDiscounts =
    pricingCalculatorHelper.getServicePriceConsideringDiscounts(
      packagePricingItem.services,
      selectedYear,
      selectedServices
    );

  return {
    basePrice: servicesBasePrice,
    finalPrice: servicesPriceConsideringDiscounts,
    calculatedServices: packagePricingItem.services,
  };
};

const calculateServicePrice = ({
  serviceCandidate,
  selectedServices,
  selectedYear,
}: {
  serviceCandidate: ServiceType;
  selectedServices: ServiceType[];
  selectedYear: ServiceYear;
}): {
  calculatedServices: ServiceType[];
} & PriceCalculationResult => {
  const activePackageWithGivenService =
    pricingCalculatorHelper.getActivePackageWithGivenService(
      serviceCandidate,
      selectedServices
    );

  const isPackActive = !!activePackageWithGivenService;

  if (isPackActive) {
    return calculatePricingItem(
      activePackageWithGivenService!,
      selectedServices,
      selectedYear
    );
  }

  const servicesBasePrice = pricingCalculatorHelper.getServiceBasePrice(
    [serviceCandidate],
    selectedYear,
    selectedServices
  );

  const servicePriceConsideringDiscounts =
    pricingCalculatorHelper.getServicePriceConsideringDiscounts(
      [serviceCandidate],
      selectedYear,
      selectedServices
    );

  return {
    basePrice: servicesBasePrice,
    finalPrice: servicePriceConsideringDiscounts,
    calculatedServices: [serviceCandidate],
  };
};

export const calculatePrice = (
  selectedServices: ServiceType[],
  selectedYear: ServiceYear
): PriceCalculationResult => {
  if (!selectedServices.length) {
    return { basePrice: 0, finalPrice: 0 };
  }

  let calculatedServices: ServiceType[] = [];

  let sumOfRegularPrices = 0;
  let sumOfFinalPrices = 0;

  selectedServices.forEach((service) => {
    const isServiceAlreadyCalculated =
      pricingCalculatorHelper.checkIsServiceAlreadyCalculated(
        calculatedServices,
        service
      );

    if (isServiceAlreadyCalculated) {
      return;
    }

    const servicePriceCalculationResult = calculateServicePrice({
      serviceCandidate: service,
      selectedServices,
      selectedYear,
    });

    sumOfRegularPrices += servicePriceCalculationResult.basePrice;
    sumOfFinalPrices += servicePriceCalculationResult.finalPrice;
    calculatedServices = [
      ...calculatedServices,
      ...servicePriceCalculationResult.calculatedServices,
    ];
  });

  return { basePrice: sumOfRegularPrices, finalPrice: sumOfFinalPrices };
};
