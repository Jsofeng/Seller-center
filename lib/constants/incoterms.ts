export const INCOTERM_OPTIONS = [
  { code: "EXW", label: "EXW — Ex Works" },
  { code: "FOB", label: "FOB — Free on Board" },
  { code: "CFR", label: "CFR — Cost and Freight" },
] as const;

export type IncotermCode = (typeof INCOTERM_OPTIONS)[number]["code"];

export const INCOTERM_CURRENCY_OPTIONS = ["USD", "RMB"] as const;
export type IncotermCurrency = (typeof INCOTERM_CURRENCY_OPTIONS)[number];

export const INCOTERM_PORT_OPTIONS = ["Shanghai Port", "Ningbo Port", "Guangzhou Port", "Bandar Abbas"] as const;
export type IncotermPort = (typeof INCOTERM_PORT_OPTIONS)[number];

