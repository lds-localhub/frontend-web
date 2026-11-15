import { Menu as BaseMenu } from "@base-ui/react/menu";
import type { ReactNode } from "react";
import { Link } from "react-router";
import { Avatar } from "./Avatar";
import styles from "./Menu.module.css";

// Uma opção do menu: uma ligação (`to`) ou uma ação (`onClick`)
export type MenuItem = {
  label: string;
  to?: string;
  onClick?: () => void;
  tone?: "danger";
  disabled?: boolean;
};

type Props = {
  trigger: ReactNode;
  triggerLabel: string;
  header?: { name: string; subtitle: string; detail: string };
  items: MenuItem[];
};

// Menu aberto por um botão, com um topo opcional (avatar, nome e duas linhas) e as opções
export function Menu({ trigger, triggerLabel, header, items }: Props) {
  return (
    <BaseMenu.Root>
      <BaseMenu.Trigger className={styles.trigger} aria-label={triggerLabel}>
        {trigger}
        <span className={styles.chevron} aria-hidden="true">
          ⌄
        </span>
      </BaseMenu.Trigger>
      <BaseMenu.Portal>
        <BaseMenu.Positioner className={styles.positioner} align="end" sideOffset={8}>
          <BaseMenu.Popup className={styles.popup}>
            {header && (
              <div className={styles.header}>
                <Avatar name={header.name} />
                <div>
                  <p className={styles.name}>{header.name}</p>
                  <p className={styles.subtitle}>{header.subtitle}</p>
                  <p className={styles.subtitle}>{header.detail}</p>
                </div>
              </div>
            )}
            {items.map((item) =>
              item.to !== undefined ? (
                <BaseMenu.LinkItem
                  key={item.label}
                  className={styles.item}
                  render={<Link to={item.to} />}
                  closeOnClick
                >
                  {item.label}
                </BaseMenu.LinkItem>
              ) : (
                <BaseMenu.Item
                  key={item.label}
                  className={styles.item}
                  data-tone={item.tone}
                  disabled={item.disabled}
                  onClick={item.onClick}
                >
                  {item.label}
                </BaseMenu.Item>
              ),
            )}
          </BaseMenu.Popup>
        </BaseMenu.Positioner>
      </BaseMenu.Portal>
    </BaseMenu.Root>
  );
}
