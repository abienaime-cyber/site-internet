import type { Metadata, Viewport } from "next";
import { Urbanist } from "next/font/google";
import { AppNav } from "@/components/app-nav";
import "./globals.css";

const urbanist = Urbanist({
  variable: "--font-urbanist",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Remontoir · Montres de luxe d'occasion entre particuliers",
    template: "%s · Remontoir",
  },
  description:
    "Achetez et vendez des montres de luxe d'occasion entre particuliers. Paiement sécurisé, messagerie intégrée, annonces vérifiées.",
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const dynamic = "force-dynamic";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${urbanist.variable} h-full antialiased`}>
      <body className="min-h-full">
        <AppNav />
        <div className="mx-auto w-full max-w-6xl pb-28 md:pb-16">{children}</div>
      </body>
    </html>
  );
}
