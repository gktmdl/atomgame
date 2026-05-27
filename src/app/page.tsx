import { GameClient } from "@/components/GameClient";
import { SITE_DESCRIPTION, SITE_TITLE } from "@/lib/site-brand";

export const metadata = {
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
};

export default function Home() {
  return <GameClient />;
}
