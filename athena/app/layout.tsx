import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import ConvexClientProvider from "@/modules/core/components/convex-client-provider";
import { LoaderProvider } from "@/modules/core/providers/loader-provider";
import { ToastContainer } from "react-toastify";
import { LocaleProvider } from "@/modules/core/providers/locale-provider";

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
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ConvexAuthNextjsServerProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ConvexClientProvider>
            <LocaleProvider>
              {/* <MainLayout>  */}
              <LoaderProvider>
                {children}
                <ToastContainer />
              </LoaderProvider>
              {/* </MainLayout> */}
            </LocaleProvider>
          </ConvexClientProvider>
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  );
}
