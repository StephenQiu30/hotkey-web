"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/PageHeader";
import {
  CollectionWorkspace,
  type CollectionWorkspacePagination,
} from "@/components/dashboard/CollectionWorkspace";
import { getCollectionRuns } from "@/services/hotkey/hotkey-server/collectionRuns";
import { getContents } from "@/services/hotkey/hotkey-server/contents";

export default function ContentsPage() {
  const pageSize = 20;
  const [runs, setRuns] = useState<HotKeyAPI.CollectionRunResponse[]>([]);
  const [contents, setContents] = useState<HotKeyAPI.ContentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [runPage, setRunPage] = useState(1);
  const [runCursors, setRunCursors] = useState<(string | undefined)[]>([
    undefined,
  ]);
  const [runNextCursor, setRunNextCursor] = useState<string>();
  const [contentPage, setContentPage] = useState(1);
  const [contentCursors, setContentCursors] = useState<(string | undefined)[]>([
    undefined,
  ]);
  const [contentNextCursor, setContentNextCursor] = useState<string>();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [runResult, contentResult] = await Promise.all([
        getCollectionRuns({ limit: pageSize }),
        getContents({ limit: pageSize }),
      ]);
      setRuns(runResult.data?.items ?? []);
      setContents(contentResult.data?.items ?? []);
      setRunPage(1);
      setRunCursors([undefined]);
      setRunNextCursor(runResult.data?.next_cursor);
      setContentPage(1);
      setContentCursors([undefined]);
      setContentNextCursor(contentResult.data?.next_cursor);
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : "采集数据加载失败");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadRunsPage = async (cursor: string | undefined, page: number) => {
    setLoading(true);
    try {
      const result = await getCollectionRuns({
        limit: pageSize,
        ...(cursor ? { cursor } : {}),
      });
      setRuns(result.data?.items ?? []);
      setRunNextCursor(result.data?.next_cursor);
      setRunPage(page);
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : "采集批次加载失败");
    } finally {
      setLoading(false);
    }
  };

  const loadContentsPage = async (cursor: string | undefined, page: number) => {
    setLoading(true);
    try {
      const result = await getContents({
        limit: pageSize,
        ...(cursor ? { cursor } : {}),
      });
      setContents(result.data?.items ?? []);
      setContentNextCursor(result.data?.next_cursor);
      setContentPage(page);
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : "内容加载失败");
    } finally {
      setLoading(false);
    }
  };

  const nextRunPage = () => {
    if (!runNextCursor) return;
    const page = runPage + 1;
    const cursor = runNextCursor;
    setRunCursors((history) => [...history.slice(0, runPage), cursor]);
    void loadRunsPage(cursor, page);
  };

  const previousRunPage = () => {
    if (runPage <= 1) return;
    void loadRunsPage(runCursors[runPage - 2], runPage - 1);
  };

  const nextContentPage = () => {
    if (!contentNextCursor) return;
    const page = contentPage + 1;
    const cursor = contentNextCursor;
    setContentCursors((history) => [...history.slice(0, contentPage), cursor]);
    void loadContentsPage(cursor, page);
  };

  const previousContentPage = () => {
    if (contentPage <= 1) return;
    void loadContentsPage(contentCursors[contentPage - 2], contentPage - 1);
  };

  const runsPagination: CollectionWorkspacePagination = {
    page: runPage,
    hasNext: Boolean(runNextCursor),
    loading,
    onPrevious: previousRunPage,
    onNext: nextRunPage,
  };
  const contentsPagination: CollectionWorkspacePagination = {
    page: contentPage,
    hasNext: Boolean(contentNextCursor),
    loading,
    onPrevious: previousContentPage,
    onNext: nextContentPage,
  };

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="app-page">
      <PageHeader
        action={
          <Button className="gap-2" onClick={load} variant="outline">
            <RefreshCw className={loading ? "animate-spin" : ""} />
            刷新数据
          </Button>
        }
        description="核对来源采集、内容标准化与事件聚合之间的真实数据进度。"
        eyebrow="Ingestion"
        title="采集内容"
      />
      {loading && !runs.length && !contents.length ? (
        <div className="flex min-h-80 items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <CollectionWorkspace
          contents={contents}
          contentsPagination={contentsPagination}
          runs={runs}
          runsPagination={runsPagination}
        />
      )}
    </div>
  );
}
