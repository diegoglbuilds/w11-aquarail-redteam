import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "AquaRail Red Team", description: "Herramienta adversarial de operaciones con datos simulados" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="es-MX"><body>{children}</body></html>; }
