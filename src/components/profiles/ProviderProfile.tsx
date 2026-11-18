import { Pencil } from "lucide-react";
import { toQueryString } from "@/api/client";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";
import { Loading } from "@/components/ui/Loading";
import { Stars } from "@/components/ui/Stars";
import { useProfile } from "@/hooks/useProfile";
import { formatAverageRating, formatReviewCount } from "@/utils/format";
import { ProfileReviews } from "./ProfileReviews";
import { ServiceAreaMap } from "./ServiceAreaMap";
import styles from "./ProviderProfile.module.css";

type Props = {
  id: number;
  isOwn: boolean;
  hideActions?: boolean;
  distanceKm?: number;
  serviceCategoryId?: number;
};

// Perfil profissional de um Prestador, como os Clientes o veem: o próprio tem «Editar perfil»,
// o Cliente tem «Fazer solicitação direta»; sem ações quando aberto dentro do criar serviço
export function ProviderProfile({
  id,
  isOwn,
  hideActions = false,
  distanceKm,
  serviceCategoryId,
}: Props) {
  const profile = useProfile(id);

  if (profile.isPending) {
    return <Loading />;
  }

  if (profile.isError) {
    return (
      <ErrorState
        error={profile.error}
        onRetry={() => profile.refetch()}
        retrying={profile.isFetching}
      />
    );
  }

  const p = profile.data;

  return (
    <div className={styles.profile}>
      <Card>
        <div className={styles.header}>
          <Avatar name={p.name} size="lg" />
          <div className={styles.identity}>
            <h1 className={styles.name}>{p.name}</h1>
            <div className={styles.categories}>
              {p.serviceCategories.map((c) => (
                <Badge key={c.serviceCategoryId} tone="neutral">
                  {c.name}
                </Badge>
              ))}
            </div>
            {p.averageRating === null ? (
              <p className={styles.rating}>Sem avaliações</p>
            ) : (
              <p className={styles.rating}>
                <Stars value={p.averageRating} />
                <strong>{formatAverageRating(p.averageRating)}</strong>
                <span>({formatReviewCount(p.reviewCount)})</span>
              </p>
            )}
          </div>
          {!hideActions &&
            (isOwn ? (
              <Button variant="secondary" to="/perfil/editar">
                <Pencil size={14} aria-hidden="true" />
                Editar perfil
              </Button>
            ) : (
              <Button
                to={`/servicos/novo?${toQueryString({ prestador: id, categoria: serviceCategoryId })}`}
              >
                Fazer solicitação direta
              </Button>
            ))}
        </div>
      </Card>

      <div className={styles.columns}>
        <div className={styles.column}>
          <Card>
            <h2>Apresentação</h2>
            <p className={styles.text}>{p.introduction}</p>
          </Card>
          <ProfileReviews professionalProfileId={id} />
        </div>
        <div className={styles.column}>
          <Card>
            <h2>Contactos</h2>
            <p className={styles.text}>{p.contactDetails}</p>
          </Card>
          <Card>
            <h2>Experiência</h2>
            <p className={styles.text}>{p.experience}</p>
          </Card>
          <Card>
            <h2>Localização e raio de atuação</h2>
            <ServiceAreaMap
              address={p.address}
              serviceRadiusKm={p.serviceRadiusKm}
              distanceKm={distanceKm}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
