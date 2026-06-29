/**
 * AutoTrader Connect configuration.
 *
 * The add flow is two steps:
 *   1. Find Verified Vehicle Specification (typeahead + pick match) — done by
 *      the HUMAN in attended mode (variant accuracy matters most there).
 *   2. Listing detail form (/Dealer/Listing?...VehicleSpecificationId=...) —
 *      filled by the bot. Fields have real `name` attributes (located by name).
 */

export const autotrader = {
  host: "connect.autotrader.co.za",
  // We know we're on Step 2 when the URL is a Listing page with a spec id.
  listingUrlMarker: "/Dealer/Listing",

  // Step 1 — Find Verified Vehicle Specification (dealer-specific URL).
  findUrl:
    "https://connect.autotrader.co.za/Country-1/Dealer-48055/Dealer/FindVerifiedVehicleSpecification" +
    "?RedirectUrl=%2FCountry-1%2FDealer-48055%2FDealer%2FListingVehicleSpecificationRedirect&VehicleCategory=Cars",
  step1: {
    makeModelInput: 'input[placeholder="eg: Volkswagen Golf GTI"]',
    yearPlaceholder: "e.g. 2018",
    mileagePlaceholder: "e.g. 10 000",
    treeItem: "li.e-make-model-item",
  },

  // Map Everest `service_history` values → AutoTrader dropdown labels.
  serviceHistoryMap: {
    full_franchise: "Full Franchise Service History",
    full: "Full Service History",
    full_non_franchise: "Full Service History by Non-Franchise",
    full_partial_franchise: "Full Service History Partially by Franchise",
    partial: "Partial Service History",
    none: "No Service History",
    not_applicable: "Not Applicable",
  } as Record<string, string>,
} as const;
