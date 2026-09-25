export const ROUTES = {
  overview: "/",
  convert: "/convert",
  rates: "/rates",
  transactions: "/transactions",
} as const;

export type AppScreen = keyof typeof ROUTES;

export function hrefWithDebug(path: string, debug: string | null) {
  return debug === "1" ? `${path}?debug=1` : path;
}

export function screenFromPathname(pathname: string): AppScreen {
  if (pathname === ROUTES.convert || pathname.startsWith(`${ROUTES.convert}/`)) {
    return "convert";
  }
  if (pathname === ROUTES.rates || pathname.startsWith(`${ROUTES.rates}/`)) {
    return "rates";
  }
  if (
    pathname === ROUTES.transactions ||
    pathname.startsWith(`${ROUTES.transactions}/`)
  ) {
    return "transactions";
  }
  return "overview";
}
