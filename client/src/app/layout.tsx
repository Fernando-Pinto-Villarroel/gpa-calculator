import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Jala U - GPA Calculator",
  description: "Academic GPA Calculator for Jala University",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Jala U - GPA Calculator",
  },
};

export const viewport: Viewport = {
  themeColor: "#2a4ff5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/logo.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('jala-gpa-theme');var d=t?JSON.parse(t):null;if(d&&d.state&&d.state.theme==='dark'){document.documentElement.classList.add('dark')}else if(!d){document.documentElement.classList.add('dark')}}catch(e){}})();`,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            // Keep this hex table in sync with CAREER_PALETTES in
            // src/features/career/theme.ts (accent700 per career).
            __html: `(function(){try{var colors={esp:'#c2410c'};var c=localStorage.getItem('jala-career-store');var d=c?JSON.parse(c):null;var id=d&&d.state&&d.state.selectedCareerId?d.state.selectedCareerId:'software_engineering_design_architecture';document.documentElement.setAttribute('data-career',id);var meta=document.querySelector('meta[name="theme-color"]');if(meta&&colors[id]){meta.setAttribute('content',colors[id]);}}catch(e){}})();`,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').catch(function(){});})}`,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
