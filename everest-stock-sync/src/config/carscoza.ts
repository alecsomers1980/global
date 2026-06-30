/**
 * cars.co.za portal configuration.
 *
 * All site-specific selectors and URLs live HERE so that when the portal
 * changes its UI, this is the only file you touch.
 *
 * The login selectors below are deliberately generic (they match the common
 * shape of a plain email/password form). They are *candidate lists* tried in
 * order — the first one that matches wins. Once we've seen the real logged-in
 * DOM, we replace these with exact, stable selectors (prefer data-*, name, or
 * role/label-based locators).
 */

export const carscoza = {
  // Pulled from .env so secrets never live in code.
  loginUrl: process.env.CARSCOZA_LOGIN_URL ?? "",
  stockUrl: process.env.CARSCOZA_STOCK_URL ?? "",

  login: {
    // First matching selector wins.
    username: [
      'input[name="email"]',
      'input[type="email"]',
      'input[name="username"]',
      'input[id*="email" i]',
      'input[id*="user" i]',
    ],
    password: [
      'input[name="password"]',
      'input[type="password"]',
      'input[id*="pass" i]',
    ],
    submit: [
      'button[type="submit"]',
      'input[type="submit"]',
      'button:has-text("Log in")',
      'button:has-text("Login")',
      'button:has-text("Sign in")',
    ],
    // An element that only appears AFTER a successful login. Used to confirm
    // we actually got in (vs. landing back on the login form with an error).
    // TODO: replace with a real post-login marker once we see the dashboard.
    successMarker: [
      'a:has-text("Logout")',
      'a:has-text("Log out")',
      'a:has-text("Sign out")',
      'text=/dashboard/i',
    ],
    // Element shown when login FAILS (wrong creds / locked). Optional.
    errorMarker: [
      'text=/incorrect|invalid|failed|try again/i',
    ],
  },

  // Stock list is a Mantine data-table with stable data-cy hooks (confirmed
  // from the authenticated page dump on 2026-06-29).
  stock: {
    table: '[data-cy="stock-table"]',
    // One row per vehicle (skip the header row in thead).
    row: '[data-cy="stock-table"] tbody tr',
  },

  // Add-vehicle form. Mantine generates dynamic ids per render, so we locate
  // fields by their (stable) label text, not by id. URL: /dap/stock/add/.
  addForm: {
    url: "https://www.cars.co.za/dap/stock/add/",
    labels: {
      year: "Year",
      make: "Make",
      model: "Model",
      variant: "Variant",
      mmCode: "MM Code",
      mileage: "Mileage",
      price: "Price",
      usedNew: "Used / New",
      condition: "Condition",
      colour: "Colour",
      reference: "Reference",
      description: "Enter description", // textarea has placeholder, no label
    },
    radioQuestions: {
      roadworthy: "Sold in roadworthy condition",
      finance: "Eligible for finance",
    },
    // Click-to-open native file chooser (no <input type=file> in the DOM).
    photosDropzone: '[data-cy="dap-upload-photos"]',
  },

  // Everest `features` strings → cars.co.za checkbox labels. Unmapped entries
  // are skipped (and logged). A value may map to several checkboxes.
  featureMap: {
    "ABS": ["ABS"],
    "Airbags": ["Air bags"],
    "Air Bags": ["Air bags"],
    "Alarm System": ["Alarm"],
    "Alarm": ["Alarm"],
    "Air Conditioning": ["Aircon"],
    "Climate Control": ["Climate control"],
    "Cruise Control": ["Cruise control"],
    "Power Windows": ["Electric Windows"],
    "Electric Windows": ["Electric Windows"],
    "ISOFIX": ["ISOFIX"],
    "Rear Camera": ["Rear-view camera"],
    "Reverse Camera": ["Rear-view camera"],
    "Parking Sensors": ["Park distance control"],
    "Premium Audio": ["Radio"],
    "Radio": ["Radio"],
    "Xenon/LED Lights": ["Xenon lights", "LED lights"],
    "LED Lights": ["LED lights"],
    "Xenon Lights": ["Xenon lights"],
    "Leather Seats": ["Leather seats"],
    "Heated Seats": ["Heated seats"],
    "Sunroof": ["Sunroof"],
    "Towbar": ["Towbar"],
    "Sat Nav": ["Sat nav"],
    "Navigation": ["Sat nav"],
    "Apple CarPlay": ["Apple CarPlay & Android Auto"],
    "Android Auto": ["Apple CarPlay & Android Auto"],
    "Motorplan": ["Motorplan"],
    "Motor Plan": ["Motorplan"],
    "Full Service History": ["Full service record"],
    "Wireless Charging": ["Wireless charging pad"],
    // Old Everest spelling kept for existing vehicles:
    "Tow Bar": ["Towbar"],
    // Identity entries — Everest now stores the cars.co.za spelling directly:
    "Aircon": ["Aircon"],
    "Air bags": ["Air bags"],
    "Climate control": ["Climate control"],
    "Cruise control": ["Cruise control"],
    "Leather seats": ["Leather seats"],
    "Park distance control": ["Park distance control"],
    "Rear-view camera": ["Rear-view camera"],
    "Sat nav": ["Sat nav"],
    "Xenon lights": ["Xenon lights"],
    "LED lights": ["LED lights"],
    "Apple CarPlay & Android Auto": ["Apple CarPlay & Android Auto"],
    "Heated seats": ["Heated seats"],
    "Wireless charging pad": ["Wireless charging pad"],
    "Full service record": ["Full service record"],
  } as Record<string, string[]>,
} as const;

export type PortalConfig = typeof carscoza;
