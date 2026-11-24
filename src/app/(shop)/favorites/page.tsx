import Breadcrumbs from "@/components/Breadcrumbs";
import FavoritesList from "@/components/FavoritesList";

export const metadata = { title: "Избранное" };

export default function FavoritesPage() {
  return (
    <div className="container-x pt-8">
      <Breadcrumbs items={[{ name: "Избранное" }]} />
      <h1 className="h-display mb-8 mt-6 text-5xl">Избранное</h1>
      <FavoritesList />
    </div>
  );
}
