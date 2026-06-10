import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildFacebookCaption,
  extractSocialLead,
  sanitizeSocialText,
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
});

describe("sanitizeSocialText", () => {
  it("removes em dashes and emoji", () => {
    const out = sanitizeSocialText("Kosmos — piękny 🚀 widok");
    assert.equal(out, "Kosmos - piękny widok");
  });
});