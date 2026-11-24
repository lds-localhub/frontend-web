import { MapPin } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router";
import type { ProviderSearchItem } from "@/api/types";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Rating } from "@/components/ui/Rating";
import { formatDistance } from "@/utils/format";
import { parseId } from "@/utils/parseId";
import styles from "./ProviderResult.module.css";

type Props = { result: ProviderSearchItem };

// Um Prestador nos resultados do Cliente (W11), em linha. «Ver perfil» abre o W12 com a distância
// do resultado e a categoria da pesquisa no estado da navegação: o E13 não tem a distância e a
// categoria fica pré-selecionada em «Fazer solicitação direta» (RF-F009-03, regra 5).
export function ProviderResultRow({ result }: Props) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleViewProfileClick = () =>
    navigate(`/prestadores/${result.professionalProfileId}`, {
      state: {
        distanceKm: result.distanceKm,
        serviceCategoryId: parseId(searchParams.get("serviceCategoryId")) ?? undefined,
      },
    });

  return (
    <article className={styles.row}>
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
          <MapPin size={14} aria-hidden="true" />
          {formatDistance(result.distanceKm)}
        </span>
        <Rating value={result.averageRating} count={result.reviewCount} />
        <Badge tone={result.withinServiceRadius ? "success" : "warning"}>
          {result.withinServiceRadius ? "Dentro do raio" : "Fora do raio"}
        </Badge>
        <Button variant="secondary" onClick={handleViewProfileClick}>
          Ver perfil
        </Button>
      </div>
    </article>
  );
}
