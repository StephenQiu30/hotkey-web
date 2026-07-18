import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

type CursorPaginationProps = {
  page: number;
  hasNext: boolean;
  loading?: boolean;
  pageSize?: number;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: readonly number[];
  onPrevious: () => void;
  onNext: () => void;
};

export function CursorPagination({
  page,
  hasNext,
  loading = false,
  pageSize = DEFAULT_PAGE_SIZE,
  onPageSizeChange,
  pageSizeOptions = PAGE_SIZE_OPTIONS,
  onPrevious,
  onNext,
}: CursorPaginationProps) {
  if (page === 1 && !hasNext && !onPageSizeChange) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3 sm:px-5">
      <span className="text-xs text-muted-foreground">第 {page} 页</span>
      <div className="flex flex-wrap items-center justify-end gap-3">
        {onPageSizeChange ? (
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>每页</span>
            <select
              aria-label="每页条数"
              className="h-8 rounded-md border border-input bg-background px-2 text-xs text-foreground outline-none focus:ring-2 focus:ring-ring"
              disabled={loading}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
              value={pageSize}
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option} 条
                </option>
              ))}
            </select>
          </label>
        ) : null}
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
    </div>
  );
}
