"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { CollectionWorkspace } from "@/components/dashboard/CollectionWorkspace";
import { getCollectionRuns } from "@/services/hotkey/hotkey-server/collectionRuns";
import { getContents } from "@/services/hotkey/hotkey-server/contents";

export default function ContentsPage() {
  const [runs, setRuns] = useState<HotKeyAPI.CollectionRunResponse[]>([]);
  const [contents, setContents] = useState<HotKeyAPI.ContentResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [runResult, contentResult] = await Promise.all([
        getCollectionRuns({ limit: 50 }),
        getContents({ limit: 50 }),
      ]);
      setRuns(runResult.data?.items ?? []);
      setContents(contentResult.data?.items ?? []);
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : "采集数据加载失败");
    } finally {
      setLoading(false);
    }
  }, []);

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
        <CollectionWorkspace contents={contents} runs={runs} />
      )}
    </div>
  );
}
