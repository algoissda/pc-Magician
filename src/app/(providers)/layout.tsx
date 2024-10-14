import { PropsWithChildren } from "react";
import AuthProvider from "./_provider/AuthProvider";

function ProviderLayout({ children }: PropsWithChildren) {
  return (
    <>
      <AuthProvider>{children}</AuthProvider>
    </>
  );
}

export default ProviderLayout;
