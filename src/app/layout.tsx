import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { VisualEditsMessenger } from "orchids-visual-edits";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
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
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange={false}
        >
          {children}
          <Toaster richColors position="top-right" />
          <VisualEditsMessenger />
        </ThemeProvider>
      </body>
    </html>
  );
}
