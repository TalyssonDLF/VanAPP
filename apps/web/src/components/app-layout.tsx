import * as Dropdown from "@radix-ui/react-dropdown-menu";
import {
  BookOpenCheck,
  Bus,
  CarFront,
  CheckSquare,
  ChevronDown,
  CreditCard,
  FileText,
  Gauge,
  GraduationCap,
  Map,
  Menu,
  Route,
  Settings,
  ShieldCheck,
  TriangleAlert,
  UserRound,
  Users,
  WalletCards,
  X,
} from "lucide-react";
import { useState } from "react";
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
type NavItem = readonly [string, string, typeof Gauge];
type NavGroup = { label: string; items: readonly NavItem[] };
const groups: readonly NavGroup[] = [
  { label: "Visão geral", items: [["Dashboard", "/dashboard", Gauge]] },
  {
    label: "Cadastros",
    items: [
      ["Alunos", "/alunos", GraduationCap],
      ["Responsáveis", "/responsaveis", Users],
      ["Motoristas", "/motoristas", UserRound],
      ["Veículos", "/veiculos", CarFront],
      ["Escolas", "/escolas", BookOpenCheck],
    ],
  },
  {
    label: "Operação",
    items: [
      ["Rotas", "/rotas", Route],
      ["Mapa de Alunos", "/rotas/mapa", Map],
      ["Viagens", "/operacao/viagens", Bus],
      ["Checklist", "/checklist", CheckSquare],
      ["Rastreamento", "/rastreamento", Map],
      ["Ocorrências", "/ocorrencias", TriangleAlert],
    ],
  },
  {
    label: "Financeiro",
    items: [
      ["Visão geral", "/financeiro", WalletCards],
      ["Mensalidades", "/financeiro/mensalidades", CreditCard],
    ],
  },
  {
    label: "Gestão",
    items: [
      ["Relatórios", "/relatorios", FileText],
      ["Usuários", "/usuarios", ShieldCheck],
    ],
  },
  { label: "Sistema", items: [["Configurações", "/configuracoes", Settings]] },
];
export function AppLayout() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const nav = useNavigate();
  const label =
    groups
      .flatMap((g) => g.items)
      .find((i) => location.pathname.startsWith(i[1]))?.[0] ?? "Dashboard";
  async function signout() {
    await logout();
    toast.success("Você saiu da sua conta.");
    nav("/login", { replace: true });
  }
  return (
    <div className="min-h-screen bg-white">
      <div
        className={cn(
          "fixed inset-0 z-30 bg-black/20 lg:hidden",
          !open && "hidden",
        )}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-60 border-r border-neutral-200 bg-neutral-50 transition-transform lg:translate-x-0",
          !open && "-translate-x-full",
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-neutral-200 px-4">
          <Link to="/dashboard" className="font-semibold">
            VanEscolar
          </Link>
          <Button
            variant="ghost"
            className="px-2 lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="Fechar menu"
          >
            <X size={18} />
          </Button>
        </div>
        <nav className="h-[calc(100vh-3.5rem)] overflow-y-auto px-2 py-4">
          {groups.map((g) => (
            <div className="mb-4" key={g.label}>
              <p className="mb-1 px-2 text-[11px] font-medium uppercase tracking-wide text-neutral-500">
                {g.label}
              </p>
              {g.items.map(([name, to, Icon]) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "flex h-8 items-center gap-2 rounded-md px-2 text-sm text-neutral-600 hover:bg-neutral-200/70 hover:text-neutral-950",
                      isActive && "bg-neutral-200 text-neutral-950 font-medium",
                    )
                  }
                >
                  <Icon size={16} />
                  {name}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
      </aside>
      <div className="lg:pl-60">
        <header className="sticky top-0 z-20 flex h-14 items-center border-b border-neutral-200 bg-white px-4 sm:px-6">
          <Button
            variant="ghost"
            className="mr-3 px-2 lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Abrir menu"
          >
            <Menu size={18} />
          </Button>
          <div className="text-sm text-neutral-500">
            <Link to="/dashboard" className="hover:text-neutral-900">
              VanEscolar
            </Link>
            <span className="mx-2">/</span>
            <span className="text-neutral-900">{label}</span>
          </div>
          <div className="ml-auto">
            <Dropdown.Root>
              <Dropdown.Trigger asChild>
                <button className="flex items-center gap-2 rounded-md p-1 hover:bg-neutral-100">
                  <Avatar>
                    <AvatarFallback>
                      {user?.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden max-w-40 truncate text-sm sm:block">
                    {user?.name}
                  </span>
                  <ChevronDown size={14} />
                </button>
              </Dropdown.Trigger>
              <Dropdown.Portal>
                <Dropdown.Content
                  align="end"
                  className="z-50 mt-1 w-44 rounded-md border border-neutral-200 bg-white p-1 text-sm shadow-md"
                >
                  <Dropdown.Item asChild>
                    <Link
                      className="block cursor-pointer rounded px-2 py-2 outline-none focus:bg-neutral-100"
                      to="/configuracoes/perfil"
                    >
                      Meu perfil
                    </Link>
                  </Dropdown.Item>
                  <Dropdown.Item asChild>
                    <Link
                      className="block cursor-pointer rounded px-2 py-2 outline-none focus:bg-neutral-100"
                      to="/configuracoes"
                    >
                      Configurações
                    </Link>
                  </Dropdown.Item>
                  <Dropdown.Separator className="my-1 h-px bg-neutral-200" />
                  <Dropdown.Item
                    className="cursor-pointer rounded px-2 py-2 text-red-700 outline-none focus:bg-red-50"
                    onSelect={() => void signout()}
                  >
                    Sair
                  </Dropdown.Item>
                </Dropdown.Content>
              </Dropdown.Portal>
            </Dropdown.Root>
          </div>
        </header>
        <main
          className={cn(
            "mx-auto max-w-7xl p-5 sm:p-7",
            location.pathname === "/rotas/mapa" &&
              "h-[calc(100vh-3.5rem)] min-h-0 max-w-none p-0 sm:p-0",
          )}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
