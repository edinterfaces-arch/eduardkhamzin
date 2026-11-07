import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ||
      "https://eduardkhamzin.ed-interfaces.workers.dev",
  ),
  title: "Your Name — Three eras, one designer",
  description:
    "An interactive product design portfolio through three eras of the internet. Sample projects, one continuous story.",
  openGraph: {
    title: "Three eras. One designer.",
    description:
      "Interfaces change. Curiosity stays. A sample product design portfolio.",
    type: "website",
    images: [
      {
        url: "/social-preview.png",
        width: 1200,
        height: 630,
        alt: "Three eras. One designer.",
      },
    ],
  },
  robots: { index: true, follow: true },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
