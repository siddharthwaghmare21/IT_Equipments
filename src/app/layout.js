import "./globals.css";
import AuthProvider from "@/components/common/AuthProvider";
import ToastHost from "@/components/common/ToastHost";

export const metadata = {
  title: "IT Assets & Equipment Management",
  description:
    "IT Department system for managing assets, equipment, purchases, deliveries, returns, maintenance and reports.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
        <ToastHost />
      </body>
    </html>
  );
}
