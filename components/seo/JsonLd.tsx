type JsonValue = Record<string, unknown>;

type Props = {
  data: JsonValue | JsonValue[];
};

/** Renders schema.org JSON-LD for crawlers (GSC, Rich Results). */
export default function JsonLd({ data }: Props) {
  const graph = Array.isArray(data) ? data : [data];
  const payload = graph.length === 1 ? graph[0] : graph;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  );
}
