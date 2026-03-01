"use client";

import { NextErrorProvider } from "@webtools/error-kit";

const ERROR_API_URL = "http://localhost:3000/api/errors";
const projectToken = process.env.NEXT_PUBLIC_WEBTOOLS_PROJECT_TOKEN;

export function ErrorKitWrapper({ children }: { children: React.ReactNode }) {
  return (
    <NextErrorProvider
      dsn={ERROR_API_URL}
      projectToken={"test"}
      app="hermes"
      fallback={
        <div className="grid min-h-screen place-items-center bg-zinc-100 p-4">
          <p className="text-center text-zinc-700">
            Something went wrong. The error has been reported.
          </p>
        </div>
      }
    >
      {children}
    </NextErrorProvider>
  );
}
