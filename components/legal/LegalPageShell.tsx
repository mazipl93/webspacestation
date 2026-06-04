import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { SITE_CONTAINER } from "@/lib/site-layout";

type Props = {
  title: string;
  children: React.ReactNode;
};

export default function LegalPageShell({ title, children }: Props) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20 pb-16">
        <div className={SITE_CONTAINER}>
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 text-[13px] font-medium text-text-tertiary transition-colors hover:text-text-primary"
          >
            <ArrowLeft size={14} />
            Strona główna
          </Link>
          <article className="article-panel card-surface mx-auto max-w-[72ch] px-6 py-8 sm:px-10 sm:py-10">
            <h1
              className="mb-6 font-extrabold text-text-primary"
              style={{ fontSize: "clamp(1.5rem, 4vw, 2rem)", letterSpacing: "-0.03em" }}
            >
              {title}
            </h1>
            <div className="prose-legal space-y-4 text-[15px] leading-relaxed text-text-secondary">
              {children}
            </div>
          </article>
        </div>
      </main>
      <Footer />
    </>
  );
}
