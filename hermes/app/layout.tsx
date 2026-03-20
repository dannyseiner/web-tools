import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { loadMessages } from "@webtools/client/server";
import path from "path";
import "./globals.css";
import { I18nProvider, NextErrorProvider } from "@webtools/client";

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
  const locale = "en";
  const messages = await loadMessages(
    locale,
    path.join(process.cwd(), "messages"),
  );

  return (
    <NextErrorProvider projectToken="test">
      <I18nProvider
        locale={locale}
        messages={messages}
        projectToken={process.env.NEXT_PUBLIC_WEBTOOLS_PROJECT_TOKEN!}
      >
        <html lang={locale}>
          <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          >
            {children}
          </body>
        </html>
      </I18nProvider>
    </NextErrorProvider>
  );
}
