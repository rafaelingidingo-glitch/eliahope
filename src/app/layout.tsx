import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Elia's Hope Community | Giving Hope, Education, and a Brighter Future",
  description:
    "Elia's Hope Community is a registered NGO in Mwanza, Tanzania, supporting vulnerable children and families through education, nutrition, faith, and community empowerment.",
  keywords: [
    "Elia's Hope",
    "NGO",
    "Tanzania",
    "Mwanza",
    "children",
    "education",
    "feeding program",
    "community empowerment",
    "child sponsorship",
    "charity",
  ],
  authors: [{ name: "Elia's Hope Community" }],
  icons: {
    icon: "/logo.jpeg",
  },
  openGraph: {
    title: "Elia's Hope Community",
    description:
      "Giving Hope, Education, and a Brighter Future to Children in Mwanza, Tanzania",
    siteName: "Elia's Hope Community",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Elia's Hope Community",
    description:
      "Giving Hope, Education, and a Brighter Future to Children in Mwanza, Tanzania",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
