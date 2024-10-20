import { PropsWithChildren } from "react";
import Header from "./_components/header/header";
// import Footer from "./_components/footer/footer";

function RootLayout({ children }: PropsWithChildren) {
  return (
    <div
      id="root-layout"
      className="bg-gradient-to-r from-[#0d1117] to-black h-screen flex flex-col overflow-hidden"
    >
      <Header />
      <div className="flex-grow overflow-hidden">{children}</div>
      {/* <Footer /> */}
    </div>
  );
}

export default RootLayout;
