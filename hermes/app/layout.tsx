import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ErrorKitWrapper } from "./ErrorKitWrapper";
import { I18nWrapper } from "./I18nWrapper";
import { loadMessages } from "@webtools/client/server";
import path from "path";
import "./globals.css";

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
    <html lang={locale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorKitWrapper>
          <I18nWrapper locale={locale} messages={messages}>
            {children}
          </I18nWrapper>
        </ErrorKitWrapper>
      </body>
    </html>
  );
}
