import type { Metadata } from "next";
import "./globals.css";
import AuthInitializer from "@/components/AuthInitializer";

export const metadata: Metadata = {
  title: "SohCahToa Holdings — Secure Fintech Dashboard",
  description:
    "Transaction monitoring admin dashboard for SohCahToa Payout BDC. Monitor FX transactions, manage cards, and track real-time financial data.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AuthInitializer />
        {children}
      </body>
    </html>
  );
}
