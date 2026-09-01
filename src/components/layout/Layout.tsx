import type { ReactNode } from "react";
import { TopHeader } from "./TopHeader";
import { BottomNavigation } from "./BottomNavigation";

interface LayoutProps {
  children: ReactNode;
  title?: string;
  showBack?: boolean;
}

export function Layout({ children, title, showBack }: LayoutProps) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <TopHeader title={title} showBack={showBack} />
      <main
        style={{
          flex: 1,
          paddingTop: 80,
          paddingBottom: 96,
          paddingLeft: 16,
          paddingRight: 16,
          maxWidth: 680,
          margin: "0 auto",
          width: "100%",
        }}
      >
        {children}
      </main>
      <BottomNavigation />
    </div>
  );
}
