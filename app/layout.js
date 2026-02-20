import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "Precision AI Scout - VC Intelligence Platform",
  description: "AI-powered venture capital sourcing and intelligence platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased bg-slate-50`}>
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex-1 flex flex-col lg:ml-0 ml-0">
            <Header />
            <main className="flex-1 p-6 overflow-auto">
              <div className="max-w-7xl mx-auto">
                {children}
              </div>
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
