import { Navigate } from "@solidjs/router";
import { useFlags } from "~/contexts/flags";

export default function Home() {
  const { getFlag } = useFlags()

  if (!getFlag('cutscene.intro')) {
    return <Navigate href="/dialog/intro" />
  } else {
    return (
      <Navigate href="map" />
    );
  }
}
