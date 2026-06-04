import Link from "next/link";
import { ChevronRight } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import OpsDataSourceNote from "@/components/discover/OpsDataSourceNote";
import { BELOW_FIXED_NAV_OFFSET_CLASS, SITE_CONTAINER } from "@/lib/site-layout";
import { cn } from "@/lib/cn";

type Props = {
  overline: string;
  title: string;
  description: string;
  accent?: string;
  opsLive?: boolean;
  opsFetchedAt?: string;
  children: React.ReactNode;
};

export default function DiscoverPageShell({
  overline,
  title,
  description,
  accent = "#38bdf8",
  opsLive = true,
  opsFetchedAt,
  children,
}: Props) {
  return (
    <>
      <Navbar />
      <main className={cn("min-h-screen", BELOW_FIXED_NAV_OFFSET_CLASS)}>
        <div
          className="border-b border-hairline"
          style={{
            background: `radial-gradient(ellipse 70% 140% at 0% 0%, ${accent}22 0%, transparent 58%), transparent`,
          }}
        >
          <div className={cn(SITE_CONTAINER, "pb-6 pt-4 sm:pb-8")}>
            <nav
              aria-label="Breadcrumb"
              className="mb-5 flex items-center gap-1.5 text-[11px] text-text-tertiary"
            >
              <Link href="/" className="transition-colors duration-200 hover:text-text-primary">
                WSS
              </Link>
              <ChevronRight size={11} className="opacity-40" />
              <span style={{ color: accent }}>Odkrywaj</span>
              <ChevronRight size={11} className="opacity-40" />
              <span className="text-text-secondary">{title}</span>
            </nav>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="max-w-[720px]">
                <span
                  className="overline mb-2 block"
                  style={{ color: accent }}
                >
                  {overline}
                </span>
                <h1
                  className="font-extrabold text-text-primary"
                  style={{
                    fontSize: "clamp(1.75rem, 4vw, 2.35rem)",
                    letterSpacing: "-0.03em",
                  }}
                >
                  {title}
                </h1>
                <p className="mt-3 max-w-[58ch] text-[15px] leading-relaxed text-text-secondary">
                  {description}
                </p>
              </div>
              <OpsDataSourceNote live={opsLive} fetchedAt={opsFetchedAt} />
            </div>
          </div>
        </div>

        <div className={cn(SITE_CONTAINER, "min-w-0 max-w-full overflow-x-clip py-8 sm:py-10")}>
          {children}
        </div>
      </main>
      <Footer />
    </>
  );
}
