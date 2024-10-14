import React, { PropsWithChildren } from "react";
import Header from "./_components/header/header";

function RootLayout({ children }: PropsWithChildren) {
  return (
    <div id="root-layout" className="bg-black">
      <Header />
      {children}
    </div>
  );
}

export default RootLayout;
