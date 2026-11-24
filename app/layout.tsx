import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PreferencesProvider } from "@/components/providers/preferences-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { ToastProvider } from "@/components/toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wildlife Monitoring System - BTNGL",
  description:
    "Sistem pelacakan pergerakan satwa liar untuk Balai Taman Nasional Gunung Leuser.",
};

type RootLayoutProps = {
  children: ReactNode;
};

const COLOR_SCHEME_INIT_SCRIPT =
  'try{var s=localStorage.getItem("color-scheme");if(s==="light"||s==="dark")document.querySelector(\'meta[name="color-scheme"]\').content=s;var l=localStorage.getItem("app-locale");if(l==="en"||l==="id")document.documentElement.lang=l;}catch(e){}';

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="id" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light dark" />
        <script dangerouslySetInnerHTML={{ __html: COLOR_SCHEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full bg-background text-foreground">
        <PreferencesProvider>
          <QueryProvider>
            <ToastProvider>{children}</ToastProvider>
          </QueryProvider>
        </PreferencesProvider>
      </body>
    </html>
  );
}
