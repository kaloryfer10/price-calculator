import { ServiceType } from "./service-type";
import { ServiceYear } from "./service-year";

export type ServicePricingItemPriceByYear = {
  value: number;
  year: ServiceYear;
};

export type ServicePricingItemDiscount = {
  price: number;
  requiredService: ServiceType | null;
  requiredYear?: ServiceYear;
};

export type ServicePricingItem = {
  services: ServiceType[];
  regularPrice: number | undefined;
  pricesByYear?: ServicePricingItemPriceByYear[];
  discounts?: ServicePricingItemDiscount[];
};
