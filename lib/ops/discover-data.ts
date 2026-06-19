/** Gradient tła kart startów — jedyny eksport z dawnego pliku mocków. */

/** Anchor harmonogramu na /starty — linki „Pełny harmonogram” z homepage i widgetów. */
export const STARTY_SCHEDULE_HREF = "/starty#harmonogram";

export const OPS_LAUNCH_IMAGE_GRADIENT = {
  launchHue: (h: number) =>
    `radial-gradient(ellipse at 50% 90%, hsla(${h},80%,56%,0.46) 0%, hsla(${h},66%,36%,0.2) 22%, transparent 48%), linear-gradient(180deg, #060b14 0%, #08111f 100%)`,
};
