// app/layout.tsx
import "@/styles/globals.css";
import Navbar from "@/components/Navbar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* CHANGED: 
         1. Added 'bg-neutral-950' (Soft Dark Background for WHOLE app)
         2. Added 'text-neutral-200' (Soft White text for WHOLE app)
      */}
      <body className="bg-neutral-950 text-neutral-200">
        <Navbar />
        <main>
           {children}
        </main>
      </body>
    </html>
  );
}