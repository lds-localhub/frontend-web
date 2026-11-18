import { ProviderProfile } from "@/components/profiles/ProviderProfile";
import { useMe } from "@/hooks/useMe";

export function MyProfilePage() {
  const { data: me } = useMe();

  return (
    <>
      <title>O meu perfil · LocalHub</title>
      <ProviderProfile id={me!.professionalProfileId!} isOwn />
    </>
  );
}
