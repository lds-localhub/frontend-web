import { MapPin } from "lucide-react";
import { formatDistance } from "@/utils/format";
import styles from "./ServiceAreaMap.module.css";

type Props = { address: string; serviceRadiusKm: number; distanceKm?: number };

// Ilustração da zona de atuação (a morada no centro e o raio à volta), com a morada e o raio por baixo.
// A distância só aparece quando o perfil foi aberto a partir de uma pesquisa.
export function ServiceAreaMap({ address, serviceRadiusKm, distanceKm }: Props) {
  return (
    <div className={styles.area}>
      <div className={styles.map}>
        <div className={styles.radius}>
          <MapPin className={styles.pin} size={18} />
          <span className={styles.radiusLabel}>{serviceRadiusKm} km</span>
        </div>
      </div>
      <p className={styles.address}>{address}</p>
      <p className={styles.details}>
        Raio de atuação: {serviceRadiusKm} km
        {distanceKm !== undefined && ` · Distância: ${formatDistance(distanceKm)}`}
      </p>
    </div>
  );
}
