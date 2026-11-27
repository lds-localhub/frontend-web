import { CalendarDays, MapPin, Wrench } from "lucide-react";
import type { CategoryRef } from "@/api/types";
import { formatAvailability, formatDate, formatDistance } from "@/utils/format";
import styles from "./ServiceMeta.module.css";

type Props = {
  category?: CategoryRef;
  location?: string;
  distanceKm?: number;
  requestedStartDate: string;
  requestedEndDate: string | null;
  publishedAt?: string; // só nos serviços abertos a propostas (W18)
};

// Dados de um serviço numa linha: categoria, publicação, local, distância e disponibilidade
export function ServiceMeta({
  category,
  location,
  distanceKm,
  requestedStartDate,
  requestedEndDate,
  publishedAt,
}: Props) {
  return (
    <ul className={styles.meta}>
      {category && (
        <li>
          <Wrench size={14} aria-hidden="true" />
          {category.name}
          {publishedAt && ` · Publicado a ${formatDate(publishedAt)}`}
        </li>
      )}
      {location && (
        <li>
          <MapPin size={14} aria-hidden="true" />
          {location}
        </li>
      )}
      {distanceKm !== undefined && <li>{formatDistance(distanceKm)}</li>}
      <li>
        <CalendarDays size={14} aria-hidden="true" />
        Disponibilidade: {formatAvailability(requestedStartDate, requestedEndDate)}
      </li>
    </ul>
  );
}
