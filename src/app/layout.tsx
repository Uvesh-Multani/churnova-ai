import type { Metadata } from "next";
import { Syne, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { VisualEditsMessenger } from "orchids-visual-edits";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { ClerkProvider } from "@clerk/nextjs";

const syne = Syne({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-syne",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-dm-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "Churnova AI – Intelligent Usage Health & Silent Churn Detection",
  description:
    "Predict. Protect. Prevent Churn. AI-powered SaaS intelligence that identifies engagement decline, abnormal usage, and churn risk before customers leave.",
  openGraph: {
    title: "Churnova AI",
    description: "Intelligent Usage Health & Silent Churn Detection Platform",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning className={`${syne.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}>
        <body suppressHydrationWarning className="font-sans antialiased bg-base text-primary">
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            forcedTheme="light"
            enableSystem={false}
            disableTransitionOnChange={false}
          >
            {children}
            <Toaster richColors position="top-right" />
            <VisualEditsMessenger />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
