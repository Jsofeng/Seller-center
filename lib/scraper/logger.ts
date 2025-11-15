import type { ScrapeLogger } from "./types";

export function createConsoleLogger(prefix = "scraper"): ScrapeLogger {
  return {
    info(message, meta) {
      console.log(formatMessage(prefix, "info", message, meta));
    },
    warn(message, meta) {
      console.warn(formatMessage(prefix, "warn", message, meta));
    },
    error(message, meta) {
      console.error(formatMessage(prefix, "error", message, meta));
    },
  };
}

function formatMessage(
  prefix: string,
  level: "info" | "warn" | "error",
  message: string,
  meta?: unknown,
) {
  const time = new Date().toISOString();
  const base = `[${time}] [${prefix}] [${level.toUpperCase()}] ${message}`;
  if (meta === undefined || meta === null) {
    return base;
  }
  if (typeof meta === "object") {
    const metaObject = meta as Record<string, unknown>;
    if (!Object.keys(metaObject).length) {
      return base;
    }
    return `${base} ${JSON.stringify(metaObject)}`;
  }
  return `${base} ${String(meta)}`;
}


