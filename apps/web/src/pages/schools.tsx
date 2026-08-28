import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { schoolsApi, type School, type SchoolInput } from "@/lib/api/schools";
import { PageHeader, LoadingRows } from "@/components/resource-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
const colors = [
  ["#2563EB", "Azul"],
  ["#16A34A", "Verde"],
  ["#7C3AED", "Roxo"],
  ["#CA8A04", "Amarelo"],
  ["#DB2777", "Rosa"],
  ["#0891B2", "Ciano"],
  ["#EA580C", "Laranja"],
  ["#DC2626", "Vermelho"],
];
const fields = [
  ["postalCode", "CEP"],
  ["street", "Rua / Logradouro"],
  ["number", "Número"],
  ["complement", "Complemento"],
  ["neighborhood", "Bairro"],
  ["city", "Cidade"],
  ["state", "Estado"],
] as const;
export function SchoolsList() {
  const [data, setData] = useState<School[]>();
  useEffect(() => {
    schoolsApi.list({ page: 1, pageSize: 100 }).then((r) => setData(r.data));
  }, []);
  return (
    <>
      <PageHeader
        title="Escolas"
        description="Gerencie escolas, endereços e cores no mapa."
        action={
          <Button asChild>
            <Link to="/escolas/nova">
              <Plus size={16} />
              Nova escola
            </Link>
          </Button>
        }
      />
      {!data ? (
        <LoadingRows />
      ) : (
        <div className="mt-6 divide-y border-y">
          {data.map((s) => (
            <Link
              className="flex items-center gap-3 p-4 hover:bg-neutral-50"
              to={`/escolas/${s.id}`}
              key={s.id}
            >
              <span
                className="h-4 w-4 rounded-full"
                style={{ background: s.mapColor }}
              />
              <strong>{s.name}</strong>
              <span className="ml-auto text-sm text-neutral-500">
                {s.studentCount ?? 0} alunos
              </span>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
export function SchoolForm() {
  const { id } = useParams(),
    nav = useNavigate(),
    {
      register,
      handleSubmit,
      reset,
      watch,
      formState: { isSubmitting },
    } = useForm<SchoolInput>({
      defaultValues: {
        name: "",
        mapColor: colors[0][0],
        postalCode: "",
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
      },
    });
  useEffect(() => {
    if (id) schoolsApi.one(id).then(reset);
  }, [id, reset]);
  const submit = async (d: SchoolInput) => {
    const saved = id
      ? await schoolsApi.update(id, d)
      : await schoolsApi.create(d);
    toast.success("Escola salva.");
    nav(`/escolas/${saved.id}`);
  };
  return (
    <>
      <PageHeader
        title={id ? "Editar escola" : "Nova escola"}
        description="Dados da escola e localização."
      />
      <form
        className="mt-7 max-w-3xl space-y-7"
        onSubmit={handleSubmit(
          (v) =>
            void submit(v).catch(() => toast.error("Não foi possível salvar.")),
        )}
      >
        <section className="space-y-4">
          <h2 className="font-semibold">Dados da escola</h2>
          <Field label="Nome">
            <Input required {...register("name")} />
          </Field>
          <Field label="Cor no mapa">
            <div className="flex flex-wrap gap-2">
              {colors.map(([value, label]) => (
                <label
                  title={label}
                  className={`flex cursor-pointer items-center gap-2 rounded border p-2 ${watch("mapColor") === value ? "ring-2 ring-neutral-800" : ""}`}
                  key={value}
                >
                  <input
                    className="sr-only"
                    type="radio"
                    value={value}
                    {...register("mapColor")}
                  />
                  <span
                    className="h-5 w-5 rounded-full"
                    style={{ background: value }}
                  />
                  {label}
                </label>
              ))}
            </div>
          </Field>
        </section>
        <Address title="Endereço" register={register} />
        <div className="flex justify-end gap-2 border-t pt-5">
          <Button
            type="button"
            variant="outline"
            onClick={() => nav("/escolas")}
          >
            Cancelar
          </Button>
          <Button disabled={isSubmitting}>Salvar escola</Button>
        </div>
      </form>
    </>
  );
}
export function SchoolDetail() {
  const { id } = useParams(),
    [s, setS] = useState<School>();
  useEffect(() => {
    if (id) schoolsApi.one(id).then(setS);
  }, [id]);
  if (!s) return <LoadingRows />;
  return (
    <>
      <PageHeader
        title={s.name}
        action={
          <Button asChild>
            <Link to={`/escolas/${s.id}/editar`}>Editar</Link>
          </Button>
        }
      />
      <div className="mt-6 max-w-3xl border-y py-5">
        <p className="flex items-center gap-2">
          <span
            className="h-4 w-4 rounded-full"
            style={{ background: s.mapColor }}
          />
          Cor no mapa
        </p>
        <p className="mt-4 text-sm">
          {[s.street, s.number, s.neighborhood, s.city, s.state]
            .filter(Boolean)
            .join(", ") || "Sem endereço"}
        </p>
        <p className="mt-2 text-sm text-neutral-500">
          {s.studentCount ?? 0} alunos vinculados
        </p>
      </div>
    </>
  );
}
function Address({
  title,
  register,
}: {
  title: string;
  register: ReturnType<typeof useForm<SchoolInput>>["register"];
}) {
  return (
    <section className="space-y-4 border-t pt-6">
      <h2 className="font-semibold">{title}</h2>
      <div className="grid gap-5 sm:grid-cols-2">
        {fields.map(([name, label]) => (
          <Field label={label} key={name}>
            <Input
              maxLength={name === "state" ? 2 : undefined}
              {...register(name)}
            />
          </Field>
        ))}
      </div>
    </section>
  );
}
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
