import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, clearToken } from "@/api/client";
import type { Me } from "@/api/types";
import { Avatar } from "@/components/ui/Avatar";
import { Menu, type MenuItem } from "@/components/ui/Menu";
import { roleLabels } from "@/utils/labels";

type Props = { me: Me };

// Menu da conta de todos os papéis: dados do utilizador, ligações da conta e terminar sessão
export function AccountMenu({ me }: Props) {
  const qc = useQueryClient();

  const logout = useMutation({
    mutationFn: () => api<void>("/auth/logout", { method: "POST" }),
    // Mesmo que o pedido falhe, a sessão termina neste browser. Recarrega em vez de navegar: limpar a
    // cache não volta a desenhar o cabeçalho, que ficaria com o menu da conta até à próxima ação
    onSettled: () => {
      clearToken();
      qc.clear();
      window.location.assign("/login");
    },
  });

  const items: MenuItem[] = [
    ...(me.role === "CLIENT" ? [{ label: "A minha localização", to: "/conta/localizacao" }] : []),
    ...(me.role === "PROVIDER" && me.professionalProfileId
      ? [{ label: "O meu perfil", to: "/perfil" }]
      : []),
    { label: "Alterar palavra-passe", to: "/conta/palavra-passe" },
    {
      label: "Terminar sessão",
      onClick: () => logout.mutate(),
      tone: "danger",
      disabled: logout.isPending,
    },
  ];

  return (
    <Menu
      trigger={
        <>
          <Avatar name={me.name} /> {me.name.split(" ")[0]}
        </>
      }
      triggerLabel={`Menu da conta de ${me.name}`}
      header={{ name: me.name, subtitle: roleLabels[me.role], detail: me.email }}
      items={items}
    />
  );
}
