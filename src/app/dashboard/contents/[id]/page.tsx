"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Loader2, RefreshCw, ShieldAlert } from "lucide-react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ContentDocumentViewer } from "@/components/dashboard/ContentDocumentViewer";
import { getContentsIdDocument } from "@/services/hotkey/hotkey-server/contents";

type DetailError = 403 | 404 | 503;

const errorCode = (reason: unknown): DetailError => {
  if (reason && typeof reason === "object" && "code" in reason) {
    const code = Number((reason as { code?: unknown }).code);
    if (code === 403 || code === 404 || code === 503) return code;
  }
  return 503;
};

const errorCopy: Record<DetailError, { title: string; description: string }> = {
  403: {
    title: "无权查看该归档内容",
    description: "当前账号没有读取此内容的权限，请返回采集内容或联系管理员。",
  },
  404: {
    title: "内容不存在",
    description: "内容可能已被删除，或者地址中的内容编号无效。",
  },
  503: {
    title: "归档暂不可用",
    description: "归档存储暂时无法读取，请稍后重试。页面不会展示缓存中的旧正文。",
  },
};

export default function ContentDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const validId = Number.isSafeInteger(id) && id > 0;
  const [document, setDocument] = useState<HotKeyAPI.ContentDocumentResponse>();
  const [error, setError] = useState<DetailError>();
  const [loading, setLoading] = useState(validId);

  const load = useCallback(async () => {
    if (!validId) {
      setDocument(undefined);
      setError(404);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(undefined);
    setDocument(undefined);
    try {
      const result = await getContentsIdDocument({ id });
      if (!result.data) throw Object.assign(new Error("empty response"), { code: 503 });
      setDocument(result.data);
    } catch (reason) {
      setDocument(undefined);
      setError(errorCode(reason));
    } finally {
      setLoading(false);
    }
  }, [id, validId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-60px)] items-center justify-center">
        <Loader2 aria-label="加载归档内容" className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !document) {
    const copy = errorCopy[error ?? 503];
    return (
      <main className="app-page">
        <div className="panel mx-auto flex min-h-80 max-w-2xl flex-col items-center justify-center px-6 text-center">
          <ShieldAlert className="mb-4 h-6 w-6 text-muted-foreground" />
          <h1 className="text-xl font-semibold">{copy.title}</h1>
          <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{copy.description}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <a href="/dashboard/contents">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" /> 返回采集内容
              </Button>
            </a>
            {error === 503 ? (
              <Button onClick={load} className="gap-2">
                <RefreshCw className="h-4 w-4" /> 重试
              </Button>
            ) : null}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="app-page document-page">
      <ContentDocumentViewer document={document} />
    </main>
  );
}
