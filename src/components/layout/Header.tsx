import { Link, NavLink } from "react-router";
import logo from "@/assets/logo.svg";
import styles from "./Header.module.css";

// Barra superior de todas as páginas: logótipo, navegação e acesso à sessão
export function Header() {
  return (
    <header className={styles.header}>
      <nav className={styles.nav} aria-label="Principal">
        <Link to="/" className={styles.brand}>
          <span className={styles.mark}>
            <img src={logo} alt="" width={18} height={18} />
          </span>
          LocalHub
        </Link>
        <div className={styles.links}>
          <NavLink to="/pesquisa/prestadores" className={styles.navLink}>
            Pesquisar Prestadores
          </NavLink>
        </div>
        <div className={styles.session}>
          <Link to="/login" className={styles.loginLink}>
            Iniciar sessão
          </Link>
          <Link to="/registar" className={styles.registerButton}>
            Registar
          </Link>
        </div>
      </nav>
    </header>
  );
}
