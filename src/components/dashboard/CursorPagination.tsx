import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type CursorPaginationProps = {
  page: number;
  hasNext: boolean;
  loading?: boolean;
  onPrevious: () => void;
  onNext: () => void;
};

export function CursorPagination({
  page,
  hasNext,
  loading = false,
  onPrevious,
  onNext,
}: CursorPaginationProps) {
  if (page === 1 && !hasNext) return null;

  return (
    <div className="flex items-center justify-between border-t border-border px-4 py-3 sm:px-5">
      <span className="text-xs text-muted-foreground">第 {page} 页</span>
      <div className="flex items-center gap-2">
        <Button
          aria-label="上一页"
          disabled={loading || page <= 1}
          onClick={onPrevious}
          size="sm"
          variant="outline"
        >
          <ChevronLeft />
          上一页
        </Button>
        <Button
          aria-label="下一页"
          disabled={loading || !hasNext}
          onClick={onNext}
          size="sm"
          variant="outline"
        >
          下一页
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}
