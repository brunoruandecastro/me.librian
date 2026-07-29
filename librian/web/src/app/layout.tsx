import type { Metadata } from "next";
import { DM_Sans, Fraunces, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ShelfProvider } from "@/contexts/ShelfContext";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Librian — sua biblioteca pessoal",
  description: "Organize seu acervo literário físico com curadoria e visibilidade social.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning: extensões do browser (ex.: LanguageTool) injetam
    // atributos em <html>/<body> antes do React hidratar e geram falso positivo.
    <html lang="pt-BR" data-theme="dark" suppressHydrationWarning>
      <body
        className={`${dmSans.variable} ${fraunces.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider>
          <AuthProvider>
            <ShelfProvider>
              {children}
            </ShelfProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
