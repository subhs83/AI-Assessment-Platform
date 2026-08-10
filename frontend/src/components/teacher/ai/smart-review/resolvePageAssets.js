export default function resolvePageAssets(page, assets = {}) {
  const resolve = (ids = [], items = []) => {
    if (!ids.length || !items.length) {
      return [];
    }

    const itemMap = new Map(
      items.map((item) => [item.id, item])
    );

    return ids
      .map((id) => itemMap.get(id))
      .filter(Boolean);
  };

  return {
    figures: resolve(page.figure_ids, assets.figures),
    equations: resolve(page.equation_ids, assets.equations),
    graphs: resolve(page.graph_ids, assets.graphs),
    tables: resolve(page.table_ids, assets.tables),
    images: resolve(page.image_ids, assets.images),
  };
}