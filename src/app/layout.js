import "./globals.css";

export const metadata = {
  title: "IT Assets Management",
  description: "IT Assets and Equipment Management System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-100 text-gray-900">
        {children}
      </body>
    </html>
  );
}
