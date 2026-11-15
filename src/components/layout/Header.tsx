import { Link, NavLink } from "react-router";
import type { Me } from "@/api/types";
import logo from "@/assets/logo.svg";
import { AccountMenu } from "./AccountMenu";
import styles from "./Header.module.css";

type Props = { me: Me | undefined };

type NavItem = { label: string; to: string };

// Navegação de cada tipo de utilizador; o Prestador sem perfil só tem o menu da conta
function navOf(me: Me | undefined): NavItem[] {
  if (!me || me.role === "CLIENT") {
    const search = { label: "Pesquisar Prestadores", to: "/pesquisa/prestadores" };
    if (!me) {
      return [search];
    }
    return [
      search,
      { label: "Os meus serviços", to: "/servicos" },
      { label: "Criar serviço", to: "/servicos/novo" },
      { label: "Relatório", to: "/cliente/relatorio" },
    ];
  }
  if (me.role === "PROVIDER") {
    if (!me.professionalProfileId) {
      return [];
    }
    return [
      { label: "Solicitações recebidas", to: "/solicitacoes" },
      { label: "Pesquisar serviços", to: "/pesquisa/servicos" },
      { label: "As minhas propostas", to: "/propostas" },
      { label: "Relatório", to: "/prestador/relatorio" },
    ];
  }
  return [
    { label: "Contas", to: "/admin/contas" },
    { label: "Categorias", to: "/admin/categorias" },
  ];
}

// Barra superior de todas as páginas: logótipo, navegação do papel e acesso à sessão
export function Header({ me }: Props) {
  return (
    <header className={styles.header}>
      <nav className={styles.nav} aria-label="Principal">
        <Link to="/" className={styles.brand}>
          <span className={styles.mark}>
            <img src={logo} alt="" width={18} height={18} />
          </span>
          LocalHub
          {me?.role === "ADMIN" && <span className={styles.adminBadge}>Admin</span>}
        </Link>
        <div className={styles.links}>
          {navOf(me).map((item) => (
            <NavLink key={item.to} to={item.to} className={styles.navLink}>
              {item.label}
            </NavLink>
          ))}
        </div>
        <div className={styles.session}>
          {me ? (
            <AccountMenu me={me} />
          ) : (
            <>
              <Link to="/login" className={styles.loginLink}>
                Iniciar sessão
              </Link>
              <Link to="/registar" className={styles.registerButton}>
                Registar
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
