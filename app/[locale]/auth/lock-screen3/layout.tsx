import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Instituto Etchegoyen",
  description: "Sistema de Gestión Institucional del Instituto Técnico Etchegoyen.",
};
const Layout = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export default Layout;
