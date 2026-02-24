// ─────────────────────────────────────────────────────────────────────────────
// Wedding Timeline – Shared Configuration
// Single source of truth: used by the web page AND the /api/wedding-timeline/config
// endpoint so mobile apps can consume the same data.
// ─────────────────────────────────────────────────────────────────────────────

export type CeremonyType = "muslim" | "christian";

export type CeremonyVariation =
  | "muslim_katb_ketab_wedding"
  | "muslim_katb_ketab_only"
  | "muslim_wedding_only"
  | "christian_church_venue"
  | "christian_church_only";

export type WeddingFeature = {
  id: string;
  /** Label shown in the wizard checklist */
  label: string;
  /** Default duration in minutes */
  defaultDuration: number;
  /** Ordering bucket */
  category: "before" | "zaffa" | "after";
  /** Sort order within the generated timeline */
  order: number;
  /** If true: always included, hidden from the user's checklist */
  hidden?: boolean;
  /** If set: only available for these ceremony variations */
  allowedVariations?: CeremonyVariation[];
  /** What each party is doing during this event */
  activities: {
    bride: string;
    groom: string;
    bridesmaids: string;
    groomsmen: string;
  };
};

export const CEREMONY_OPTIONS: {
  id: CeremonyType;
  label: string;
  variations: { id: CeremonyVariation; label: string }[];
}[] = [
  {
    id: "muslim",
    label: "Muslim Ceremony",
    variations: [
      { id: "muslim_katb_ketab_wedding", label: "Katb Ketab + Wedding" },
      { id: "muslim_katb_ketab_only", label: "Katb Ketab Only" },
      { id: "muslim_wedding_only", label: "Wedding Only" },
    ],
  },
  {
    id: "christian",
    label: "Christian Ceremony",
    variations: [
      { id: "christian_church_venue", label: "Church + Venue" },
      { id: "christian_church_only", label: "Church Only" },
    ],
  },
];

export const FEATURES: WeddingFeature[] = [
  {
    id: "arrival",
    label: "Arrival at the venue",
    defaultDuration: 45,
    category: "before",
    order: 1,
    hidden: true,
    activities: {
      bride: "Arrival at the venue",
      groom: "_",
      bridesmaids: "_",
      groomsmen: "_",
    },
  },
  {
    id: "hair",
    label: "Hair & Veil",
    defaultDuration: 60,
    category: "before",
    order: 2,
    activities: {
      bride: "Hair Styling",
      groom: "_",
      bridesmaids: "Hair Styling (for non hijabis)",
      groomsmen: "_",
    },
  },
  {
    id: "makeup",
    label: "Makeup",
    defaultDuration: 105,
    category: "before",
    order: 3,
    activities: {
      bride: "Makeup",
      groom: "Arriving & Getting Ready",
      bridesmaids: "Arriving & Getting Ready",
      groomsmen: "Arriving & Getting Ready",
    },
  },
  {
    id: "getting_ready",
    label: "Getting ready pictures",
    defaultDuration: 30,
    category: "before",
    order: 4,
    activities: {
      bride: "Getting Ready Photos",
      groom: "Break",
      bridesmaids: "Getting Ready Photos",
      groomsmen: "Break",
    },
  },
  {
    id: "dress_suit",
    label: "Wearing dress & suit",
    defaultDuration: 30,
    category: "before",
    order: 4.5,
    hidden: true,
    activities: {
      bride: "Wearing Dress",
      groom: "Wearing Suit",
      bridesmaids: "Helping Bride",
      groomsmen: "Helping Groom",
    },
  },
  {
    id: "first_look",
    label: "First look",
    defaultDuration: 15,
    category: "before",
    order: 5,
    activities: {
      bride: "First Look",
      groom: "First Look",
      bridesmaids: "cheering the couple up",
      groomsmen: "cheering the couple up",
    },
  },
  {
    id: "photoshoot",
    label: "Photoshoot",
    defaultDuration: 120,
    category: "before",
    order: 6,
    activities: {
      bride: "Couple Photoshoot",
      groom: "Couple Photoshoot",
      bridesmaids: "Group Photos",
      groomsmen: "Group Photos",
    },
  },
  {
    id: "moving_to_church",
    label: "Moving to Church",
    defaultDuration: 30,
    category: "before",
    order: 7.5,
    allowedVariations: ["christian_church_venue", "christian_church_only"],
    activities: {
      bride: "Heading to Church / Guest Arrival",
      groom: "Heading to Church / Guest Arrival",
      bridesmaids: "Heading to Church / Guest Arrival",
      groomsmen: "Heading to Church / Guest Arrival",
    },
  },
  {
    id: "Guest_Arrival",
    label: "Guest Arrival",
    defaultDuration: 10,
    category: "before",
    order: 7.8,
    activities: {
      bride: "_",
      groom: "Greeting Guests",
      bridesmaids: "Greeting Guests",
      groomsmen: "Greeting Guests",
    },
  },
  {
    id: "katb_ketab",
    label: "Katb Ketab",
    defaultDuration: 30,
    category: "before",
    order: 8,
    allowedVariations: ["muslim_katb_ketab_wedding", "muslim_katb_ketab_only"],
    activities: {
      bride: "Katb Ketab Ceremony",
      groom: "Katb Ketab Ceremony",
      bridesmaids: "Katb Ketab Ceremony",
      groomsmen: "Katb Ketab Ceremony",
    },
  },
  {
    id: "Grand_Entrance",
    label: "Grand Entrance",
    defaultDuration: 10,
    category: "before",
    order: 8.7,
    allowedVariations: [
      "muslim_katb_ketab_wedding",
      "muslim_wedding_only",
      "christian_church_venue",
    ],
    activities: {
      bride: "Grand Entrance",
      groom: "Grand Entrance",
      bridesmaids: "Grand Entrance",
      groomsmen: "Grand Entrance",
    },
  },
  {
    id: "katb_ketab_pictures_greetings",
    label: "Katb Ketab Pictures & Greetings",
    defaultDuration: 60,
    category: "before",
    order: 8.1,
    allowedVariations: ["muslim_katb_ketab_only"],
    activities: {
      bride: "Pictures & Greetings",
      groom: "Pictures & Greetings",
      bridesmaids: "Photos",
      groomsmen: "Photos",
    },
  },
  {
    id: "church",
    label: "Church Ceremony",
    defaultDuration: 60,
    category: "before",
    order: 8,
    allowedVariations: ["christian_church_venue", "christian_church_only"],
    activities: {
      bride: "Church Ceremony",
      groom: "Church Ceremony",
      bridesmaids: "Church Ceremony",
      groomsmen: "Church Ceremony",
    },
  },
  {
    id: "salamat",
    label: "Salamat & Pictures",
    defaultDuration: 45,
    category: "after",
    order: 8.2,
    allowedVariations: ["christian_church_venue", "christian_church_only"],
    activities: {
      bride: "Salamat & Photos",
      groom: "Salamat & Photos",
      bridesmaids: "Salamat & Photos",
      groomsmen: "Salamat & Photos",
    },
  },
  {
    id: "moving_to_venue",
    label: "Moving to Venue",
    defaultDuration: 30,
    category: "after",
    order: 8.5,
    allowedVariations: ["christian_church_venue"],
    activities: {
      bride: "Heading to Venue",
      groom: "Heading to Venue",
      bridesmaids: "Heading to Venue",
      groomsmen: "Heading to Venue",
    },
  },
  {
    id: "settling",
    label: "Settling",
    defaultDuration: 30,
    category: "after",
    order: 8.6,
    allowedVariations: ["christian_church_venue"],
    activities: {
      bride: "Freshening Up",
      groom: "Freshening Up",
      bridesmaids: "Helping Bride",
      groomsmen: "Helping Groom",
    },
  },
  {
    id: "zaffa",
    label: "Zaffa",
    defaultDuration: 15,
    category: "zaffa",
    order: 9,
    allowedVariations: ["muslim_katb_ketab_wedding", "muslim_wedding_only"],
    activities: {
      bride: "Zaffa / Entrance",
      groom: "Zaffa / Entrance",
      bridesmaids: "Zaffa / Entrance",
      groomsmen: "Zaffa / Entrance",
    },
  },
  {
    id: "party_before_dinner",
    label: "Party",
    defaultDuration: 60,
    category: "after",
    order: 9.5,
    hidden: true,
    allowedVariations: [
      "muslim_katb_ketab_wedding",
      "muslim_wedding_only",
      "christian_church_venue",
    ],
    activities: {
      bride: "Party / Dancing",
      groom: "Party / Dancing",
      bridesmaids: "Party / Dancing",
      groomsmen: "Party / Dancing",
    },
  },
  {
    id: "dinner",
    label: "Dinner",
    defaultDuration: 60,
    category: "after",
    order: 10,
    allowedVariations: [
      "muslim_katb_ketab_wedding",
      "muslim_wedding_only",
      "christian_church_venue",
    ],
    activities: {
      bride: "Dinner",
      groom: "Dinner",
      bridesmaids: "Dinner",
      groomsmen: "Dinner",
    },
  },
  {
    id: "party_after_dinner",
    label: "Party",
    defaultDuration: 120,
    category: "after",
    order: 11,
    hidden: true,
    allowedVariations: [
      "muslim_katb_ketab_wedding",
      "muslim_wedding_only",
      "christian_church_venue",
    ],
    activities: {
      bride: "Party / Dancing",
      groom: "Party / Dancing",
      bridesmaids: "Party / Dancing",
      groomsmen: "Party / Dancing",
    },
  },
];
