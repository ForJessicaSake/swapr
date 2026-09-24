export type ApiErrorCode =
  | "QUOTE_EXPIRED"
  | "INSUFFICIENT_FUNDS"
  | "INVALID_REQUEST"
  | "QUOTE_NOT_FOUND"
  | "RATES_UNAVAILABLE"
  | "NOT_IMPLEMENTED";

export type ApiErrorBody = {
  error: {
    code: ApiErrorCode;
    message: string;
  };
};
