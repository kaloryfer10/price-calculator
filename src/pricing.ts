import { ServicePricingItem } from "./types/service-pricing";

export const pricing: ServicePricingItem[] = [
  {
    services: ["Photography"],
    regularPrice: undefined,
    pricesByYear: [
      { value: 1700, year: 2020 },
      { value: 1800, year: 2021 },
      { value: 1900, year: 2022 },
    ],
  },
  {
    services: ["VideoRecording"],
    regularPrice: undefined,
    pricesByYear: [
      { value: 1700, year: 2020 },
      { value: 1800, year: 2021 },
      { value: 1900, year: 2022 },
    ],
  },
  {
    services: ["Photography", "VideoRecording"],
    regularPrice: undefined,
    pricesByYear: [
      { value: 2200, year: 2020 },
      { value: 2300, year: 2021 },
      { value: 2500, year: 2022 },
    ],
  },
  {
    services: ["WeddingSession"],
    regularPrice: 600,
    discounts: [
      {
        requiredService: "Photography",
        price: 300,
      },
      {
        requiredService: "VideoRecording",
        price: 300,
      },
      {
        requiredService: "Photography",
        price: 0,
        requiredYear: 2022,
      },
    ],
  },
  {
    services: ["BlurayPackage"],
    regularPrice: 300,
  },
  {
    services: ["TwoDayEvent"],
    regularPrice: 400,
  },
];
