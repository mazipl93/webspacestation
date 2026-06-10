import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildFacebookCaption,
  buildFacebookHashtagLine,
  extractFirstSentence,
  extractShareCardSubline,
  extractSocialLead,
  fitShareCardLine,
  formatFacebookHashtag,
  sanitizeSocialText,
  stripCmsHeadingMarker,
} from "@/lib/social/facebook-caption";

describe("buildFacebookCaption", () => {
  it("includes title, excerpt and article URL", () => {
    const caption = buildFacebookCaption(
      {
        title: "Artemis III ogłoszone",
        excerpt: "NASA potwierdziła skład załogi misji księżycowej.",
      },
      "https://webspacestation.pl/aktualnosci/artemis-iii",
    );

    assert.match(caption, /Artemis III ogłoszone/);
    assert.match(caption, /NASA potwierdziła skład załogi/);
    assert.match(
      caption,
      /https:\/\/webspacestation\.pl\/aktualnosci\/artemis-iii/,
    );
  });

  it("prefers first paragraph from content over excerpt", () => {
    const lead = extractSocialLead({
      title: "Tytuł",
      excerpt: "Lead z CMS",
      content:
        "<p>Teleskop Jamesa Webba zarejestrował w podczerwieni wczesne fazy formowania gwiazd w pobliżu młodych protogwiazd.</p>",
    });

    assert.match(lead, /Teleskop Jamesa Webba/);
    assert.doesNotMatch(lead, /Lead z CMS/);
  });

  it("appends clickable hashtags from article tags after the link", () => {
    const caption = buildFacebookCaption(
      {
        title: "Galaktyka Sombrero w nowym świetle",
        excerpt: "Teleskop pokazał strukturę dysku jak nigdy dotąd.",
        tags: ["NASA", "mgławica planetarna", "Sombrero", "NASA"],
      },
      "https://webspacestation.pl/aktualnosci/sombrero",
    );

    assert.match(caption, /#NASA #mgławicaplanetarna #Sombrero/);
    assert.match(caption, /Czytaj więcej: https:\/\/webspacestation\.pl/);
    const linkIdx = caption.indexOf("Czytaj więcej:");
    const hashtagIdx = caption.indexOf("#NASA");
    assert.ok(hashtagIdx > -1 && hashtagIdx > linkIdx);
  });

  it("strips CMS # heading marker from lead and caption", () => {
    const content =
      "# Galaktyczny kapelusz, który zachwyca od ponad dwóch stuleci i nadal inspiruje astronomów";

    const lead = extractSocialLead({ title: "Tytuł", content });
    assert.match(lead, /Galaktyczny kapelusz/);
    assert.doesNotMatch(lead, /^#/);
    assert.doesNotMatch(lead, /# Galaktyczny/);

    const caption = buildFacebookCaption(
      { title: "Sombrero w nowym świetle", content },
      "https://webspacestation.pl/aktualnosci/test",
    );
    assert.doesNotMatch(caption, /# Galaktyczny/);
    assert.match(caption, /Galaktyczny kapelusz/);
  });
});

describe("stripCmsHeadingMarker", () => {
  it("removes leading hash levels used in CMS", () => {
    assert.equal(
      stripCmsHeadingMarker("## Podtytuł sekcji"),
      "Podtytuł sekcji",
    );
  });
});

describe("formatFacebookHashtag", () => {
  it("joins multi-word tags and strips punctuation", () => {
    assert.equal(formatFacebookHashtag("mgławica planetarna"), "#mgławicaplanetarna");
    assert.equal(formatFacebookHashtag("Tc 1"), "#Tc1");
    assert.equal(formatFacebookHashtag("#JWST"), "#JWST");
    assert.equal(formatFacebookHashtag("a"), null);
  });
});

describe("buildFacebookHashtagLine", () => {
  it("dedupes tags case-insensitively", () => {
    assert.equal(
      buildFacebookHashtagLine(["NASA", "nasa", "ESA"]),
      "#NASA #ESA",
    );
  });
});

describe("extractShareCardSubline", () => {
  it("prefers excerpt over body lead", () => {
    const subline = extractShareCardSubline({
      title: "Tytuł",
      excerpt: "Krótki hook na kartę graficzną.",
      content:
        "<p>Długi pierwszy akapit z treści artykułu, który trafia tylko do posta na Facebooku i nie powinien być na obrazku.</p>",
    });
    assert.equal(subline, "Krótki hook na kartę graficzną.");
  });

  it("falls back to first sentence of lead without ellipsis", () => {
    const content =
      "# Galaktyczny kapelusz, który zachwyca od ponad dwóch stuleci. Drugie zdanie tylko do FB.";
    const subline = extractShareCardSubline({ title: "Tytuł", content });
    assert.equal(
      subline,
      "Galaktyczny kapelusz, który zachwyca od ponad dwóch stuleci.",
    );
    assert.doesNotMatch(subline, /…/);
  });
});

describe("fitShareCardLine", () => {
  it("clips at sentence boundary instead of adding ellipsis", () => {
    const text =
      "Pierwsze zdanie jest krótkie. Drugie zdanie jest znacznie dłuższe i nie powinno się pojawić na karcie.";
    const out = fitShareCardLine(text, 40);
    assert.equal(out, "Pierwsze zdanie jest krótkie.");
    assert.doesNotMatch(out, /…/);
  });
});

describe("extractFirstSentence", () => {
  it("returns one sentence when punctuation present", () => {
    assert.equal(
      extractFirstSentence("Alpha. Beta gamma."),
      "Alpha.",
    );
  });
});

describe("sanitizeSocialText", () => {
  it("removes em dashes and emoji", () => {
    const out = sanitizeSocialText("Kosmos — piękny 🚀 widok");
    assert.equal(out, "Kosmos - piękny widok");
  });
});