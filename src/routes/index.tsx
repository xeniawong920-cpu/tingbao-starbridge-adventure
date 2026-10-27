import { createFileRoute } from "@tanstack/react-router";
import { StarGame } from "@/components/StarGame";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "星星失物招領所：給婷寶的星光" },
      { name: "description", content: "一款送給婷寶的 Q 版生日冒險小遊戲：收集星星、重溫法國回憶，在星光橋上相遇。" },
      { property: "og:title", content: "星星失物招領所：給婷寶的星光" },
      { property: "og:description", content: "Q 版像素生日冒險遊戲，從英國到香港的星光禮物。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="min-h-screen bg-background">
      <StarGame />
    </main>
  );
}
