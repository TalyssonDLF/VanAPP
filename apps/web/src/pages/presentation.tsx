import { useEffect } from "react";
import { BenefitsAndSteps, FinalCta, HeroSection, OperationSection, PresentationNavbar, ProblemSection, ProductSections } from "@/components/presentation/presentation-sections";

export function PresentationPage(){
  useEffect(()=>{document.title="VanEscolar | Gestão para Transporte Escolar";return()=>{document.title="VanEscolar"}},[]);
  return <div className="presentation min-h-screen overflow-x-hidden bg-white text-neutral-950"><PresentationNavbar/><main><HeroSection/><ProblemSection/><ProductSections/><OperationSection/><BenefitsAndSteps/><FinalCta/></main></div>;
}
