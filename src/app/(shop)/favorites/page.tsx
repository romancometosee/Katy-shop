import Breadcrumbs from "@/components/Breadcrumbs";
import PageClose from "@/components/PageClose";
import FavoritesList from "@/components/FavoritesList";

export const metadata = { title: "Избранное" };

export default function FavoritesPage() {
  return (
    <div className="container-x pt-8">
      <div className="flex items-center justify-between gap-4"><Breadcrumbs items={[{ name: "Избранное" }]} /><PageClose /></div>
      <h1 className="h-display mb-8 mt-6 text-5xl">Избранное</h1>
      <FavoritesList />
    </div>
  );
}
