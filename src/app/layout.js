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
    <html lang="en" suppressHydrationWarning>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  var savedTheme = localStorage.getItem("itAssetTheme");
                  var shouldUseDark = savedTheme === "dark";
                  document.documentElement.classList.toggle("dark", shouldUseDark);
                } catch (error) {
                  document.documentElement.classList.remove("dark");
                }
              })();
            `,
          }}
        />
        <AuthProvider>{children}</AuthProvider>
        <ToastHost />
      </body>
    </html>
  );
}
