import ShareBar from "@/components/article/ShareBar";
import Comments from "@/components/article/Comments";

type Props = {
  slug: string;
  title: string;
};

// Reader engagement block (share + comments), aligned to the article column.
// The empty sidebar track keeps the main column the same width as ArticleBody.
export default function ArticleInteractions({ slug, title }: Props) {
  return (
    <div className="container-site overflow-x-hidden pb-6 pt-4">
      <div className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="flex min-w-0 flex-col gap-6">
          <div className="mb-4 flex items-center gap-3">
            <span className="h-px flex-1 bg-white/12" />
            <span className="overline text-on-page-muted">Dyskusja</span>
            <span className="h-px flex-1 bg-white/12" />
          </div>
          <ShareBar title={title} slug={slug} />
          <Comments slug={slug} />
        </div>
        <div aria-hidden="true" className="hidden xl:block" />
      </div>
    </div>
  );
}
