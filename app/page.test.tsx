import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";
import Home from "./page";

describe("AquaRail operator screen",()=>{
  it("shows simulated sensor and scoring disclosures",()=>{render(<Home/>);expect(screen.getByText(/datos y sensores simulados/i)).toBeInTheDocument();expect(screen.getByText(/puntuación simulada/i)).toBeInTheDocument()});
  it("shows the shadow clause and no automated dispatch action",()=>{render(<Home/>);expect(screen.getByText(/No se permite priorizar por capacidad de pago/i)).toBeInTheDocument();expect(screen.getByText(/Sin perfilado punitivo de hogares, racionamiento automatizado ni despacho mayor automático/i)).toBeInTheDocument();expect(screen.queryByRole("button",{name:/despachar/i})).not.toBeInTheDocument()});
  it("does not claim simulated Mexican pilot results",()=>{render(<Home/>);expect(screen.queryByText(/piloto mexicano|resultados de campo/i)).not.toBeInTheDocument()});
  it("does not call the merely repaired event verified",()=>{render(<Home/>);fireEvent.click(screen.getByText(/AR-104 · Zona ficticia Sur 03/));expect(screen.getByText(/Reparación registrada; resultado aún sin verificar/i)).toBeInTheDocument();expect(screen.getAllByText("Reparado")).toHaveLength(2)});
  it("shows adversarial summary counters",()=>{render(<Home/>);expect(screen.getByText("Eventos simulados")).toBeInTheDocument();expect(screen.getByText("Cierres bloqueados")).toBeInTheDocument()});
  it("clarifies that evidence fields are declarations and are not authenticated",()=>{render(<Home/>);expect(screen.getByText(/Esta demo no adjunta ni autentica pruebas.*verificación requiere revisión humana de evidencia fuera de esta herramienta/i)).toBeInTheDocument()});
  it("clarifies that evidence fields are declarations and are not authenticated",()=>{render(<Home/>);expect(screen.getByText(/Esta demo no adjunta ni autentica pruebas.*verificación requiere revisión humana de evidencia fuera de esta herramienta/i)).toBeInTheDocument()});
  it("blocks and records an attempted false-success transition",()=>{render(<Home/>);fireEvent.click(screen.getByRole("button",{name:"Verificar resultado"}));expect(screen.getByRole("alert")).toHaveTextContent(/Cierre no verificado/i);expect(screen.getByText(/1 intento\(s\) bloqueado\(s\)/i)).toBeInTheDocument()});
  it("requires a valid human override reason",()=>{render(<Home/>);fireEvent.click(screen.getByRole("button",{name:"Guardar revisión humana"}));expect(screen.getByRole("alert")).toHaveTextContent(/al menos 12 caracteres/i);fireEvent.change(screen.getByLabelText(/Motivo obligatorio/i),{target:{value:"Interrupción de servicio en zona"}});fireEvent.click(screen.getByRole("button",{name:"Guardar revisión humana"}));expect(screen.getByText(/Anterior #\d+ → nueva #1/)).toBeInTheDocument()});
});
