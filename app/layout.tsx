import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Battlefield 6 Stats Dashboard",
  description: "Your personal Battlefield 6 gameplay statistics dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

