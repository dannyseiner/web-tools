import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import {
  loadAllMessages,
  loadMessages,
  LOCALE_COOKIE_NAME,
} from "@webtools/client/server";
import path from "path";
import { cookies } from "next/headers";
import "./globals.css";
import {
  ErrorBoundary,
  I18nProvider,
  NextErrorProvider,
} from "@webtools/client";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Web tools",
  description: "Make your development faster and easier",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const locale = cookieStore.get(LOCALE_COOKIE_NAME)?.value ?? "cs";
  const raw = await loadMessages(locale, path.join(process.cwd(), "messages"));

  // const messages: Record<string, unknown> = {};
  // for (const [ns, content] of Object.entries(raw)) {
  //   const inner = content as Record<string, unknown>;
  //   messages[ns] = inner[ns] ?? inner;
  // }

  return (
    <NextErrorProvider>
      <I18nProvider locale={locale} messages={raw?.common}>
        <ErrorBoundary>
          <html lang={locale}>
            <body
              className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
              {children}
            </body>
          </html>
        </ErrorBoundary>
      </I18nProvider>
    </NextErrorProvider>
  );
}
