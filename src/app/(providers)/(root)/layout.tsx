import React, { PropsWithChildren } from "react";
import Header from "./_components/header/header";
import Footer from "./_components/footer/footer";

function RootLayout({ children }: PropsWithChildren) {
  return (
    <div id="root-layout" className="bg-black">
      <Header />
      {children}
      <Footer />
    </div>
  );
}

export default RootLayout;
