import ShareBar from "@/components/article/ShareBar";
import Comments from "@/components/article/Comments";
import SocialFollowStrip from "@/components/social/SocialFollowStrip";
import {
  ARTICLE_PAGE_GRID,
  ARTICLE_SHELL,
} from "@/lib/ui/article-editorial-layout";
import { cn } from "@/lib/cn";

type Props = {
  slug: string;
  title: string;
};

// Reader engagement block (share + comments), aligned to the article column.
// The empty sidebar track keeps the main column the same width as ArticleBody.
export default function ArticleInteractions({ slug, title }: Props) {
  return (
    <div className={cn(ARTICLE_SHELL, "overflow-x-hidden pb-6 pt-4")}>
      <div className={ARTICLE_PAGE_GRID}>
        <div className="flex min-w-0 flex-col gap-6">
          <div className="mb-4 flex items-center gap-3">
            <span className="h-px flex-1 bg-white/12" />
            <span className="overline text-on-page-muted">Dyskusja</span>
            <span className="h-px flex-1 bg-white/12" />
          </div>
          <ShareBar title={title} slug={slug} />
          <Comments slug={slug} />
        </div>
        <SocialFollowStrip variant="sidebar" />
      </div>
    </div>
  );
}
