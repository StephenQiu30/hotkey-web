import { ExternalLink, FileText } from "lucide-react";

type EventEvidenceTimelineProps = {
  contents: HotKeyAPI.ContentResponse[];
  totalCount: number;
  failedCount: number;
  unavailable?: boolean;
};

const formatDateTime = (value?: string) =>
  value
    ? new Intl.DateTimeFormat("zh-CN", {
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(value))
    : "—";

const contentTitle = (content: HotKeyAPI.ContentResponse) =>
  content.title || content.external_id || `内容 #${content.id ?? "—"}`;

export function EventEvidenceTimeline({
  contents,
  totalCount,
  failedCount,
  unavailable = false,
}: EventEvidenceTimelineProps) {
  return (
    <section className="py-6" aria-labelledby="event-evidence-heading">
      <div className="flex flex-col gap-2 border-b border-border pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 id="event-evidence-heading" className="text-sm font-medium">
            证据叙事（按时间）
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            当前展示 {contents.length} / 共 {totalCount} 条
          </p>
        </div>
        {failedCount > 0 ? (
          <p className="text-xs text-amber-400">部分证据暂不可读（{failedCount} 条）</p>
        ) : null}
      </div>

      {unavailable ? (
        <div className="panel mt-5 flex min-h-44 flex-col items-center justify-center px-6 text-center">
          <FileText className="mb-3 h-5 w-5 text-muted-foreground" />
          <p className="text-sm font-medium">证据成员暂时无法加载</p>
          <p className="mt-1 text-xs text-muted-foreground">事件本身仍可查看，稍后刷新可重试证据列表。</p>
        </div>
      ) : contents.length ? (
        <div className="border-l border-border pl-5">
          {contents.map((content, index) => {
            const title = contentTitle(content);
            return (
              <article
                key={content.id ?? `${content.external_id ?? title}-${index}`}
                className="relative border-b border-border py-5 last:border-b-0"
              >
                <span className="absolute -left-[25px] top-6 h-2 w-2 rounded-full border-2 border-blue-500 bg-black" />
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="signal-text mono">{formatDateTime(content.published_at)}</span>
                  <span className="font-medium">{content.source_name || content.source_type || "来源"}</span>
                  <span className="ml-auto text-muted-foreground">{content.language || "—"}</span>
                </div>
                <p className="mt-2 text-sm font-medium leading-6">{title}</p>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                  <span>浏览 {content.metrics?.view_count ?? "—"}</span>
                  <span>
                    互动 {(content.metrics?.like_count ?? 0) + (content.metrics?.comment_count ?? 0) + (content.metrics?.share_count ?? 0)}
                  </span>
                  <span className="ml-auto flex flex-wrap gap-4">
                    {content.id != null ? (
                      <a
                        aria-label={`阅读归档：${title}`}
                        className="text-blue-400 no-underline"
                        href={`/dashboard/contents/${content.id}`}
                      >
                        阅读归档
                      </a>
                    ) : null}
                    {content.canonical_url ? (
                      <a
                        aria-label={`访问原站：${title}`}
                        className="inline-flex items-center gap-1 text-muted-foreground no-underline hover:text-foreground"
                        href={content.canonical_url}
                        rel="noreferrer"
                        target="_blank"
                      >
                        访问原站 <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : null}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="panel mt-5 flex min-h-44 flex-col items-center justify-center px-6 text-center">
          <FileText className="mb-3 h-5 w-5 text-muted-foreground" />
          <p className="text-sm font-medium">
            {totalCount > 0 ? "该事件有证据成员，但详情暂不可读。" : "该事件暂时没有内容证据。"}
          </p>
        </div>
      )}
    </section>
  );
}
