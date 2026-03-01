export { NextErrorProvider, ErrorProvider } from "./NextErrorProvider";
export { ErrorBoundary } from "./ErrorBoundary";
export {
  initErrorClient,
  captureException,
  installGlobalHandlers,
  type ErrorClientOptions,
  type CaptureExtras,
} from "./client";
