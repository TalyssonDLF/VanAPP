import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "@/components/app-layout";
import { PrivateRoute, PublicRoute } from "@/components/auth-guards";
import { Dashboard, NotFound, Placeholder } from "@/pages/app-pages";
import { ForgotPage, LoginPage, RegisterPage } from "@/pages/auth-pages";
import { GuardiansList, GuardianForm, GuardianDetail } from "@/pages/guardians";
import { StudentsList, StudentForm, StudentDetail } from "@/pages/students";
import { DriverDetail, DriverForm, DriversList } from "@/pages/drivers";
import { VehicleDetail, VehicleForm, VehiclesList } from "@/pages/vehicles";
import { FinancePage } from "@/pages/finance";
import { SchoolsList, SchoolForm, SchoolDetail } from "@/pages/schools";
import { StudentMapPage } from "@/pages/student-map";
const routes: [string, string, string?][] = [
  ["alunos", "Alunos", "/alunos/novo"],
  ["alunos/novo", "Novo aluno"],
  ["alunos/:id", "Aluno"],
  ["alunos/:id/editar", "Editar aluno"],
  ["responsaveis", "Responsáveis", "/responsaveis/novo"],
  ["responsaveis/novo", "Novo responsável"],
  ["responsaveis/:id", "Responsável"],
  ["responsaveis/:id/editar", "Editar responsável"],
  ["motoristas", "Motoristas", "/motoristas/novo"],
  ["motoristas/novo", "Novo motorista"],
  ["motoristas/:id", "Motorista"],
  ["motoristas/:id/editar", "Editar motorista"],
  ["veiculos", "Veículos", "/veiculos/novo"],
  ["veiculos/novo", "Novo veículo"],
  ["veiculos/:id", "Veículo"],
  ["veiculos/:id/editar", "Editar veículo"],
  ["escolas", "Escolas", "/escolas/nova"],
  ["escolas/nova", "Nova escola"],
  ["escolas/:id", "Escola"],
  ["escolas/:id/editar", "Editar escola"],
  ["rotas", "Rotas", "/rotas/nova"],
  ["rotas/nova", "Nova rota"],
  ["rotas/:id", "Rota"],
  ["rotas/:id/editar", "Editar rota"],
  ["operacao", "Viagens"],
  ["operacao/viagens", "Viagens"],
  ["operacao/viagens/:id", "Viagem"],
  ["checklist", "Checklist"],
  ["checklist/:tripId", "Checklist da viagem"],
  ["rastreamento", "Rastreamento"],
  ["financeiro", "Mensalidades"],
  ["financeiro/mensalidades", "Mensalidades"],
  ["financeiro/pagamentos", "Pagamentos"],
  ["ocorrencias", "Ocorrências"],
  ["ocorrencias/:id", "Ocorrência"],
  ["relatorios", "Relatórios"],
  ["usuarios", "Usuários", "/usuarios/novo"],
  ["usuarios/novo", "Novo usuário"],
  ["usuarios/:id/editar", "Editar usuário"],
  ["configuracoes", "Configurações"],
  ["configuracoes/empresa", "Empresa"],
  ["configuracoes/perfil", "Meu perfil"],
  ["configuracoes/seguranca", "Segurança"],
];
export default function App() {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path="login" element={<LoginPage />} />
        <Route path="cadastro" element={<RegisterPage />} />
        <Route path="esqueci-minha-senha" element={<ForgotPage />} />
      </Route>
      <Route element={<PrivateRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="alunos" element={<StudentsList />} />
          <Route path="rotas/mapa" element={<StudentMapPage />} />
          <Route path="alunos/novo" element={<StudentForm />} />
          <Route path="alunos/:id" element={<StudentDetail />} />
          <Route path="alunos/:id/editar" element={<StudentForm />} />
          <Route path="responsaveis" element={<GuardiansList />} />
          <Route path="responsaveis/novo" element={<GuardianForm />} />
          <Route path="responsaveis/:id" element={<GuardianDetail />} />
          <Route path="responsaveis/:id/editar" element={<GuardianForm />} />
          <Route path="motoristas" element={<DriversList />} />
          <Route path="motoristas/novo" element={<DriverForm />} />
          <Route path="motoristas/:id" element={<DriverDetail />} />
          <Route path="motoristas/:id/editar" element={<DriverForm />} />
          <Route path="veiculos" element={<VehiclesList />} />
          <Route path="veiculos/novo" element={<VehicleForm />} />
          <Route path="veiculos/:id" element={<VehicleDetail />} />
          <Route path="veiculos/:id/editar" element={<VehicleForm />} />
          <Route path="escolas" element={<SchoolsList />} />
          <Route path="escolas/nova" element={<SchoolForm />} />
          <Route path="escolas/:id" element={<SchoolDetail />} />
          <Route path="escolas/:id/editar" element={<SchoolForm />} />
          <Route path="financeiro" element={<FinancePage />} />
          <Route path="financeiro/mensalidades" element={<FinancePage />} />
          <Route path="financeiro/pagamentos" element={<FinancePage />} />
          {routes
            .filter(
              ([path]) =>
                !path.startsWith("alunos") &&
                !path.startsWith("responsaveis") &&
                !path.startsWith("motoristas") &&
                !path.startsWith("veiculos") &&
                !path.startsWith("escolas") &&
                !path.startsWith("financeiro"),
            )
            .map(([path, title, action]) => (
              <Route
                key={path}
                path={path}
                element={<Placeholder title={title} actionTo={action} />}
              />
            ))}
        </Route>
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
