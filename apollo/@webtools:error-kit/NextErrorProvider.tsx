"use client";

import React, { useEffect } from "react";
import { ErrorBoundary } from "./ErrorBoundary";
import {
  initErrorClient,
  installGlobalHandlers,
  ErrorClientOptions,
} from "./client";

export function NextErrorProvider(
  props: React.PropsWithChildren<
    ErrorClientOptions & { fallback?: React.ReactNode }
  >,
) {
  const { children, fallback, ...opts } = props;

  useEffect(() => {
    initErrorClient(opts);
    installGlobalHandlers();
  }, [opts.dsn, opts.app, opts.env, opts.release]);

  return <ErrorBoundary fallback={fallback}>{children}</ErrorBoundary>;
}

// alias pro pages router
export const ErrorProvider = NextErrorProvider;
