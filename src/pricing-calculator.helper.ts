import arrayService from "./common/array.service";
import { pricing } from "./pricing";
import {
  ServicePricingItem,
  ServicePricingItemDiscount,
} from "./types/service-pricing";
import { ServiceType } from "./types/service-type";
import { ServiceYear } from "./types/service-year";
import { updateSelectedServicesHelper } from "./update-selected-services.helper";

const getPricing = () => {
  return pricing;
};

const getAvailablePackages = () => {
  const pricing = getPricing();

  return pricing.filter((pricingItem) => pricingItem.services.length > 1);
};

const getAvailablePackagesWithGivenService = (
  service: ServiceType
): ServicePricingItem[] => {
  const packages = getAvailablePackages();

  return packages.filter((pack) => pack.services.includes(service));
};

const checkIsPackageActive = (
  servicePackage: ServicePricingItem,
  selectedServices: ServiceType[]
): boolean => {
  const requiredServices = servicePackage.services;

  const areAllRequiredServicesSelected = requiredServices.every(
    (selectedService) => selectedServices.includes(selectedService)
  );

  return areAllRequiredServicesSelected;
};

const getActivePackageWithGivenService = (
  service: ServiceType,
  selectedServices: ServiceType[]
): ServicePricingItem | undefined => {
  const availablePackagesWithGivenService =
    getAvailablePackagesWithGivenService(service);

  return availablePackagesWithGivenService.find((pack) =>
    checkIsPackageActive(pack, selectedServices)
  );
};

const checkIsServiceAlreadyCalculated = (
  calculatedServices: ServiceType[],
  service: ServiceType
) => {
  return calculatedServices.includes(service);
};

const getServiceActiveDiscounts = (
  pricingPosition: ServicePricingItem,
  year: ServiceYear,
  allSelectedServices: ServiceType[]
) => {
  const activeDiscounts: ServicePricingItemDiscount[] = [];

  pricingPosition.discounts?.forEach((discountPrice) => {
    const isYearConditionMet =
      !discountPrice.requiredYear || discountPrice.requiredYear === year;
    const isDependentServiceConditionMet =
      !discountPrice.requiredService ||
      allSelectedServices.includes(discountPrice.requiredService);

    if (isYearConditionMet && isDependentServiceConditionMet) {
      activeDiscounts.push(discountPrice);
    }
  });

  return activeDiscounts;
};

const getServiceActiveDiscountsPrices = (
  pricingPosition: ServicePricingItem,
  year: ServiceYear,
  allSelectedServices: ServiceType[]
) => {
  const activeDiscounts = getServiceActiveDiscounts(
    pricingPosition,
    year,
    allSelectedServices
  );

  return activeDiscounts.map((activeDiscount) => activeDiscount.price);
};

const checkCanBeBought = (
  pricingPosition: ServicePricingItem,
  allSelectedServices: ServiceType[]
): boolean => {
  return pricingPosition.services.some((service) =>
    updateSelectedServicesHelper.checkIsServicePossibleToSelect(
      allSelectedServices,
      service
    )
  );
};

const getServicePriceForGivenYear = (
  pricingPosition: ServicePricingItem,
  year: ServiceYear
): number | undefined => {
  return pricingPosition.pricesByYear?.find((pricing) => pricing.year === year)
    ?.value;
};

const getPricingItemByService = (
  service: ServiceType
): ServicePricingItem | undefined => {
  const pricing = getPricing();

  const pricingPosition = pricing.find((item) =>
    arrayService.equals(item.services, [service])
  );

  return pricingPosition;
};

const getPricingItemByServices = (
  services: ServiceType[]
): ServicePricingItem | undefined => {
  const pricing = getPricing();

  const pricingPosition = pricing.find((item) =>
    arrayService.equals(item.services, services)
  );

  return pricingPosition;
};

const getServicePriceConsideringDiscounts = (
  services: ServiceType[],
  year: ServiceYear,
  allSelectedServices: ServiceType[]
): number => {
  const pricingPosition = getPricingItemByServices(services);

  if (!pricingPosition) {
    return 0;
  }

  const canBeBought = checkCanBeBought(pricingPosition, allSelectedServices);

  if (!canBeBought) {
    return 0;
  }

  const activeDiscountsPrices = getServiceActiveDiscountsPrices(
    pricingPosition,
    year,
    allSelectedServices
  );

  const priceForGivenYear = getServicePriceForGivenYear(pricingPosition, year);

  const possiblePrices: number[] = [...activeDiscountsPrices];

  if (pricingPosition.regularPrice !== undefined) {
    possiblePrices.push(pricingPosition.regularPrice);
  }

  if (priceForGivenYear !== undefined) {
    possiblePrices.push(priceForGivenYear);
  }

  possiblePrices.push(...activeDiscountsPrices);

  return Math.min(...possiblePrices);
};

const getServiceBasePrice = (
  services: ServiceType[],
  year: ServiceYear,
  allSelectedServices: ServiceType[]
): number => {
  const pricingPosition = getPricingItemByServices(services);

  if (!pricingPosition) {
    return 0;
  }

  const canBeBought = checkCanBeBought(pricingPosition, allSelectedServices);

  if (!canBeBought) {
    return 0;
  }

  const priceForGivenYear = getServicePriceForGivenYear(pricingPosition, year);

  return priceForGivenYear ?? pricingPosition.regularPrice ?? 0;
};

export const pricingCalculatorHelper = {
  getPricing,
  checkIsServiceAlreadyCalculated,
  getAvailablePackagesWithGivenService,
  getServicePriceConsideringDiscounts,
  getServiceBasePrice,
  getPricingItemByService,
  getActivePackageWithGivenService,
};
