import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap"
});

export const metadata: Metadata = {
  title: "Опрос технической готовности к онлайн-коллегиям | Государственное унитарное предприятие «Центр цифровизации, инновации и повышения квалификации кадров сельского хозяйства»",
  description: "Анкета мониторинга технической готовности районов и областей к онлайн-коллегиям. Государственное унитарное предприятие «Центр цифровизации, инновации и повышения квалификации кадров сельского хозяйства» при Министерстве сельского хозяйства Республики Таджикистан.",
  keywords: [
    "Министерство сельского хозяйства Республики Таджикистан",
    "Государственное унитарное предприятие Центр цифровизации инновации и повышения квалификации кадров сельского хозяйства",
    "Корхонаи воҳиди давлатии Маркази рақамикунонӣ инноватсия ва такмили ихтисоси кадрҳои соҳаи кишоварзӣ",
    "Таджикистан",
    "Видеоконференцсвязь (ВКС)",
    "Видеоконференция",
    "Онлайн коллегия",
    "Опрос готовности"
  ],
  icons: {
    icon: "/icon.png",
    apple: "/icon.png"
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tg" className={`${inter.variable} ${inter.className} h-full antialiased`}>
      <body className={`${inter.className} min-h-full flex flex-col bg-slate-100/70 text-slate-800 selection:bg-emerald-600 selection:text-white`}>
        {children}
      </body>
    </html>
  );
}
