import { Lock, MapPin } from "lucide-react";
import type { ProviderSearchItem } from "@/api/types";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Rating } from "@/components/ui/Rating";
import { formatDistance } from "@/utils/format";
import styles from "./ProviderResult.module.css";

type Props = { result: ProviderSearchItem };

// Um Prestador nos resultados do Visitante, em cartão. Ver o perfil exige sessão de Cliente, por
// isso o botão leva ao início de sessão.
export function ProviderResultCard({ result }: Props) {
  return (
    <article className={styles.card}>
      <div className={styles.identity}>
        <Avatar name={result.name} />
        <div>
          <h3 className={styles.name}>{result.name}</h3>
          <p className={styles.categories}>
            {result.serviceCategories.map((c) => c.name).join(" · ")}
          </p>
        </div>
      </div>
      <div className={styles.meta}>
        <span className={styles.distance}>
          <MapPin size={14} />
          {formatDistance(result.distanceKm)}
        </span>
        <Rating value={result.averageRating} count={result.reviewCount} />
        <Badge tone={result.withinServiceRadius ? "success" : "warning"}>
          {result.withinServiceRadius ? "Dentro do raio" : "Fora do raio"}
        </Badge>
      </div>
      <Button variant="secondary" to="/login">
        <Lock size={14} />
        Iniciar sessão para ver o perfil
      </Button>
    </article>
  );
}
