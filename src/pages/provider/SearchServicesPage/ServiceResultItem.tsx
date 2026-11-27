import type { SearchServiceItem } from "@/api/types";
import { ServiceMeta } from "@/components/services/ServiceMeta";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import styles from "./ServiceResultItem.module.css";

type Props = { service: SearchServiceItem };

// Um serviço aberto a propostas nos resultados: categoria, se está dentro do raio de atuação,
// distância, disponibilidade, publicação e o início da descrição
export function ServiceResultItem({ service }: Props) {
  return (
    <article className={styles.item}>
      <div className={styles.body}>
        <h2 className={styles.title}>{service.title}</h2>
        <div className={styles.meta}>
          <Badge tone="neutral">{service.serviceCategory.name}</Badge>
          <Badge tone={service.withinServiceRadius ? "success" : "warning"}>
            {service.withinServiceRadius ? "Dentro do raio" : "Fora do raio"}
          </Badge>
          <ServiceMeta
            distanceKm={service.distanceKm}
            requestedStartDate={service.requestedStartDate}
            requestedEndDate={service.requestedEndDate}
            publishedAt={service.creationDate}
          />
        </div>
        <p className={styles.description}>«{service.description}»</p>
      </div>
      <Button variant="secondary" to={`/pesquisa/servicos/${service.serviceId}`}>
        Ver serviço
      </Button>
    </article>
  );
}
