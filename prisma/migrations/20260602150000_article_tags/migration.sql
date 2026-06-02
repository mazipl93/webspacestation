-- Structured tags on articles; move legacy subtitle encoding into tags[].
ALTER TABLE "articles" ADD COLUMN "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

UPDATE "articles"
SET
  "tags" = COALESCE(
    (
      SELECT ARRAY_AGG(trimmed ORDER BY ord)
      FROM (
        SELECT trim(t) AS trimmed, ord
        FROM unnest(
          string_to_array(
            trim(
              substring(
                "subtitle"
                FROM POSITION('wss-tags:' IN "subtitle") + char_length('wss-tags:')
              )
            ),
            ','
          )
        ) WITH ORDINALITY AS x(t, ord)
        WHERE trim(t) <> ''
      ) s
    ),
    ARRAY[]::TEXT[]
  ),
  "subtitle" = regexp_replace(
    trim(
      substring("subtitle" FROM 1 FOR POSITION('wss-tags:' IN "subtitle") - 1)
    ),
    '\s*·\s*$',
    ''
  )
WHERE "subtitle" IS NOT NULL AND "subtitle" LIKE '%wss-tags:%';
