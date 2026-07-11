import Button from "../../ui/Button";

export default function HistoryPagination({
  page,
  limit,
  dataLength,
  setPage,
}) {
  return (
    <div className="flex justify-center items-center gap-3 mt-6">

      <Button
        variant="secondary"
        disabled={page === 1}
        onClick={() => {
          setPage(page - 1);
        }}
      >
        Previous
      </Button>

      <span className="text-sm font-medium">
        Page {page}
      </span>

      <Button
        variant="secondary"
        disabled={dataLength < limit}
        onClick={() => {
          setPage(page + 1);
        }}
      >
        Next
      </Button>

    </div>
  );
}