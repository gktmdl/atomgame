import { GameClient } from "@/components/GameClient";

export const metadata = {
  title: "원자 안정성 시뮬레이터",
  description: "실제 동위원소 데이터 기반 교육용 원자 안정성 시뮬레이션 게임",
};

export default function Home() {
  return <GameClient />;
}
