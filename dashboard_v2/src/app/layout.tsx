import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { DashboardApolloProvider } from "@/components/providers/apollo-provider";

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
  title: "mnemospark Ops Console (v2)",
  description: "Internal operations dashboard — GraphQL-backed",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <DashboardApolloProvider>{children}</DashboardApolloProvider>
      </body>
    </html>
  );
}
