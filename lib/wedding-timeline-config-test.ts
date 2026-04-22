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
  | "christian_church_only"
  | "christian_venue_only";

export type CeremonyAnswers = {
  gettingReadyLocation?: "home" | "venue" | null;
  bridesmaidsAtPrep?: "yes" | "no" | null;
  //katb ketab and church
  photoAtKatbLocation?: "yes" | "no" | null;
  photoshootLocation?: "venue" | "another_place" | null;
  photoshootTiming?: "before" | "after" | null;
};

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
  /** If true: no break will be automatically added before this event */
  noBreakBefore?: boolean;
  /** If true: no break will be automatically added after this event */
  noBreakAfter?: boolean;
  /** If set: only includes feature when answers match these values. Array means OR. */
  showIf?: Partial<CeremonyAnswers> | Partial<CeremonyAnswers>[];
  /** If set: overrides specific activities when answers match these values */
  conditionalActivities?: {
    condition: Partial<CeremonyAnswers>;
    activities: Partial<{
      bride: string;
      groom: string;
      bridesmaids: string;
      groomsmen: string;
    }>;
  }[];
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
      { id: "christian_venue_only", label: "Venue Only" },
      
    ],
  },
];

export const MUSLIM_KATB_KETAB_WEDDING_FEATURES: WeddingFeature[] = [
  {
    id: "arrival",
    noBreakAfter: true,
    label: "Arrival at the venue",
    defaultDuration: 15,
    category: "before",
    order: 1,
    hidden: true,
    showIf: { gettingReadyLocation: "venue" },
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
    conditionalActivities: [
      {
        condition: { bridesmaidsAtPrep: "no" },
        activities: { bridesmaids: "_" },
      },
      {
        condition: { gettingReadyLocation: "home" },
        activities: { groom: "", groomsmen: "" },
      },
    ],
  },
  {
    id: "makeup",
    label: "Makeup",
    defaultDuration: 90,
    category: "before",
    order: 3,
    activities: {
      bride: "Makeup",
      groom: "Arriving & Getting Ready",
      bridesmaids: "Arriving & Getting Ready",
      groomsmen: "Arriving & Getting Ready",
    },
    conditionalActivities: [
      {
        condition: { bridesmaidsAtPrep: "yes" },
        activities: { bridesmaids: "Makeup" },
      },
      {
        condition: { bridesmaidsAtPrep: "no" },
        activities: { bridesmaids: "_", groomsmen: "_" },
      },
      {
        condition: { gettingReadyLocation: "home" },
        activities: { groom: "", groomsmen: "" },
      },
    ],
  },
  {
    id: "getting_ready",
    label: "Getting ready pictures",
    defaultDuration: 30,
    category: "before",
    order: 4,
    activities: {
      bride: "Getting Ready Photos",
      groom: "Getting Ready Photos",
      bridesmaids: "Getting Ready/Hair Styling",
      groomsmen: "Getting Ready/Hair Styling",
    },
    conditionalActivities: [
      {
        condition: { bridesmaidsAtPrep: "no" },
        activities: { bridesmaids: "", groomsmen: "" },
      },
    ],
  },
  {
    id: "dress_suit",
    noBreakAfter: true,
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
    conditionalActivities: [
      {
        condition: { bridesmaidsAtPrep: "no" },
        activities: { bridesmaids: "", groomsmen: "" },
      },
    ],
  },
  {
    id: "beforeLeaving",
    label: "getting ready to leave",
    defaultDuration: 15,
    category: "before",
    order: 4.6,
    activities: {
      bride: "getting ready to leave",
      groom: "getting ready to leave",
      bridesmaids: "getting ready to leave",
      groomsmen: "getting ready to leave",
    },
    noBreakAfter: true,
    conditionalActivities: [
      {
        condition: { bridesmaidsAtPrep: "no" },
        activities: { bridesmaids: "_", groomsmen: "_" },
      },
    ],
  },
  {
    id: "picking_up_bride",
    label: "Picking up the bride",
    defaultDuration: 30,
    category: "before",
    order: 4.7,
    noBreakAfter: true,
    showIf: { gettingReadyLocation: "home" },
    activities: {
      bride: "bride only pictures",
      groom: "Picking up the bride",
      bridesmaids: "Celebrating",
      groomsmen: "Celebrating",
    },
    conditionalActivities: [
      {
        condition: { bridesmaidsAtPrep: "no" },
        activities: { bridesmaids: "", groomsmen: "" },
      },
    ],
  },
  {
    id: "transport_to_photoshoot",
    label: "Moving to Photoshoot Location",
    defaultDuration: 30,
    category: "before",
    order: 4.9,
    hidden: true,
    showIf: { gettingReadyLocation: "home" },
    activities: {
      bride: "Moving to Photoshoot Location",
      groom: "Moving to Photoshoot Location",
      bridesmaids: "Moving to Photoshoot Location",
      groomsmen: "Moving to Photoshoot Location",
    },
     conditionalActivities: [
      {
        condition: { bridesmaidsAtPrep: "no" },
        activities: { bridesmaids: "", groomsmen: "" },
      },
    ],
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
    conditionalActivities: [
      {
        condition: { bridesmaidsAtPrep: "no" },
        activities: { bridesmaids: "_", groomsmen: "_" },
      },
    ],
  },
  {
    id: "couple_photoshoot",
    label: "Couple Photoshoot",
    defaultDuration: 90,
    category: "before",
    noBreakAfter: true,
    order: 6,
    activities: {
      bride: "Couple Photoshoot",
      groom: "Couple Photoshoot",
      bridesmaids: "Photoshoot Break",
      groomsmen: "Photoshoot Break",
    },
    conditionalActivities: [
      {
        condition: { bridesmaidsAtPrep: "no" },
        activities: { bridesmaids:  "" ,groomsmen:""},
      },
    ],
  },
  {
    id: "family_photoshoot",
    label: "Family Photoshoot",
    defaultDuration: 15,
    category: "before",
    noBreakAfter: true,
    order: 6.1,
    activities: {
      bride: "Family Photoshoot",
      groom: "Family Photoshoot",
      bridesmaids: "Photoshoot Break",
      groomsmen: "Photoshoot Break",
    },
      conditionalActivities: [
      {
        condition: { bridesmaidsAtPrep: "no" },
        activities: { bridesmaids: "Arriving " ,groomsmen:"Arriving"},
      },
    ],
  },
  {
    id: "bridal_party_photoshoot",
    label: "Bridal Party Photoshoot",
    defaultDuration: 15,
    category: "before",
    order: 6.2,
    activities: {
      bride: "Bridal Party Photoshoot",
      groom: "Bridal Party Photoshoot",
      bridesmaids: "Bridal Party Photoshoot",
      groomsmen: "Bridal Party Photoshoot",
    },
  },
  {
    id: "transport_to_katb_ketab",
    label: "Moving to Katb Ketab Location",
    defaultDuration: 30,
    category: "before",
    order: 6.5,
    hidden: true,
    showIf: { photoAtKatbLocation: "no" },
    activities: {
      bride: "Moving to Katb Ketab Location",
      groom: "Moving to Katb Ketab Location",
      bridesmaids: "Moving to Katb Ketab Location",
      groomsmen: "Moving to Katb Ketab Location",
    },
  },
  {
    id: "Guest_Arrival",
    noBreakBefore: true,
    noBreakAfter: true,
    label: "Guest Arrival",
    defaultDuration: 20,
    category: "before",
    order: 7.8,
    activities: {
      bride: "Guests Arrival/Bridal party break",
      groom: "Guests Arrival/Bridal party break",
      bridesmaids: "Guests Arrival/Bridal party break",
      groomsmen: "Guests Arrival/Bridal party break",
    },
  },
  {
    id: "katb_ketab",
    noBreakAfter: true,
    label: "Katb Ketab",
    defaultDuration: 30,
    category: "before",
    order: 8,
    activities: {
      bride: "Katb Ketab Ceremony",
      groom: "Katb Ketab Ceremony",
      bridesmaids: "Katb Ketab Ceremony",
      groomsmen: "Katb Ketab Ceremony",
    },
  },
  {
    id: "Grand_Entrance",
    noBreakAfter: true,
    label: "Grand Entrance",
    defaultDuration: 10,
    category: "before",
    order: 8.7,
    activities: {
      bride: "Grand Entrance",
      groom: "Grand Entrance",
      bridesmaids: "Grand Entrance",
      groomsmen: "Grand Entrance",
    },
  },
  {
    id: "zaffa",
    noBreakAfter: true,
    label: "Zaffa",
    defaultDuration: 15,
    category: "zaffa",
    order: 9,
    activities: {
      bride: "Zaffa",
      groom: "Zaffa",
      bridesmaids: "Zaffa",
      groomsmen: "Zaffa",
    },
  },
  {
    id: "party_before_dinner",
    label: "Party",
    defaultDuration: 90,
    category: "after",
    order: 9.5,
    hidden: true,
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
    activities: {
      bride: "Party / Dancing",
      groom: "Party / Dancing",
      bridesmaids: "Party / Dancing",
      groomsmen: "Party / Dancing",
    },
  },
  {
    id: "party_ends",
    label: "Party Ends",
    defaultDuration: 10,
    category: "after",
    order: 12,
    activities: {
      bride: "Party Ends",
      groom: "Party Ends",
      bridesmaids: "Party Ends",
      groomsmen: "Party Ends",
    },
  },
];
export const MUSLIM_KATB_KETAB_ONLY_FEATURES: WeddingFeature[] = [
  {
    id: "arrival",
    noBreakAfter: true,
    label: "Arrival at the venue",
    defaultDuration: 15,
    category: "before",
    order: 1,
    hidden: true,
    showIf: { gettingReadyLocation: "venue" },
    activities: {
      bride: "Arrival at the venue",
      groom: "_",
      bridesmaids: "_",
      groomsmen: "_",
    },
    // conditionalActivities: [
    //   {
    //     condition: { bridesmaidsAtPrep: "yes" },
    //     activities: { bridesmaids: "Arrival at the venue" },
    //   },
    // ],
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
    conditionalActivities: [
      {
        condition: { bridesmaidsAtPrep: "no" },
        activities: { bridesmaids: "_" ,groomsmen:"_"},
      },

    ],
  },
  {
    id: "makeup",
    label: "Makeup",
    defaultDuration: 90,
    category: "before",
    order: 3,
    activities: {
      bride: "Makeup",
      groom: "Arriving & Getting Ready",
      bridesmaids: "Arriving & Getting Ready",
      groomsmen: "Arriving & Getting Ready",
    },
    conditionalActivities: [
      {
        condition: { bridesmaidsAtPrep: "no" },
        activities: { bridesmaids: "_" ,groomsmen:"_"},
      },
            {
        condition: { gettingReadyLocation: "home" },
        activities: { groom: "Getting Ready", groomsmen: "Arriving And Getting Ready" },
      },

    ],
  },
  {
    id: "getting_ready",
    label: "Getting ready pictures",
    defaultDuration: 30,
    category: "before",
    order: 4,
    showIf: { gettingReadyLocation: "venue" },
    noBreakAfter: true,
    activities: {
      bride: "Getting Ready Photos",
      groom: "Break",
      bridesmaids: "Getting Ready Photos",
      groomsmen: "Break",
    },
    conditionalActivities: [
      {
        condition: { bridesmaidsAtPrep: "no" },
        activities: { bridesmaids: "_" ,groomsmen:"_"},
      },

    ],
  },
  {
    id: "getting_ready_2",
    label: "Getting ready pictures",
    defaultDuration: 30,
    category: "before",
    noBreakAfter:true,
    order: 4.1,
    showIf: { gettingReadyLocation: "venue" },
    activities: {
      bride: "Break",
      groom: "Getting Ready Photos",
      bridesmaids: "Break",
      groomsmen: "Getting Ready Photos",
    },
    conditionalActivities: [
      {
        condition: { bridesmaidsAtPrep: "no" },
        activities: { bridesmaids: "_" ,groomsmen:"_"},
      },

    ],
  },
    {
    id: "getting_ready_katb_ketab",
    label: "Getting ready pictures",
    defaultDuration: 30,
    category: "before",
    noBreakAfter:true,
    order: 4.1,
    showIf: { gettingReadyLocation: "home" },
    activities: {
      bride: "Getting Ready Photos",
      groom: "Getting Ready Photos",
      bridesmaids: "Getting Ready Photos",
      groomsmen: "Getting Ready Photos",
    },
    conditionalActivities: [
      {
        condition: { bridesmaidsAtPrep: "no" },
        activities: { bridesmaids: "_" ,groomsmen:"_"},
      },

    ],
  },
  {
    id: "dress_suit",
    noBreakAfter: true,
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
    conditionalActivities: [
      {
        condition: { bridesmaidsAtPrep: "no" },
        activities: { bridesmaids: "_" ,groomsmen:"_"},
      },

    ],
  },
    {
    id: "picking_up_bride",
    label: "Picking up the bride",
    defaultDuration: 30,
    category: "before",
    order: 4.7,
    noBreakAfter: true,
    showIf: { gettingReadyLocation: "home" },
    activities: {
      bride: "Waiting for the groom",
      groom: "Picking up the bride",
      bridesmaids: "Celebrating",
      groomsmen: "Celebrating",
    },
        conditionalActivities: [
      {
        condition: { bridesmaidsAtPrep: "no" },
        activities: { bridesmaids: "",groomsmen: "" },
      },
    ],
  },

  // {id:"beforeLeaving",label:"getting ready to leave",defaultDuration:15,category:"before",order:4.6,activities:{bride:"getting ready to leave",groom:"getting ready to leave",bridesmaids:"getting ready to leave",groomsmen:"getting ready to leave"}},
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
    conditionalActivities: [
      {
        condition: { bridesmaidsAtPrep: "no" },
        activities: { bridesmaids: "_" ,groomsmen:"_"},
      },

    ],
  },
  {
    id: "transport_to_photoshoot",
    label: "Heading to the photoshoot",
    defaultDuration: 30,
    category: "before",
    order: 5.5,
    hidden: true,
    showIf: [{ gettingReadyLocation: "home" }, { photoshootLocation: "another_place" }],
    activities: {
      bride: "Heading to the photoshoot",
      groom: "Heading to the photoshoot",
      bridesmaids: "Heading to the photoshoot",
      groomsmen: "Heading to the photoshoot",
    },
    conditionalActivities: [
      {
        condition: { bridesmaidsAtPrep: "no" },
        activities: { bridesmaids: "_" ,groomsmen:"_"},
      },

    ],
  },
  {
    id: "couple_photoshoot",
    label: "Couple Photoshoot",
    defaultDuration: 90,
    category: "before",
    noBreakAfter: true,
    order: 6,
    activities: {
      bride: "Couple Photoshoot",
      groom: "Couple Photoshoot",
      bridesmaids: "Photoshoot Break",
      groomsmen: "Photoshoot Break",
    },
    conditionalActivities: [
      {
        condition: { bridesmaidsAtPrep: "no" },
        activities: { bridesmaids: "" ,groomsmen:""},
      },

    ],
  },
  {
    id: "family_photoshoot",
    label: "Family Photoshoot",
    defaultDuration: 15,
    category: "before",
    noBreakAfter: true,
    order: 6.1,
    activities: {
      bride: "Family Photoshoot",
      groom: "Family Photoshoot",
      bridesmaids: "Photoshoot Break",
      groomsmen: "Photoshoot Break",
    },
    conditionalActivities: [
      {
        condition: { bridesmaidsAtPrep: "no" },
        activities: { bridesmaids: "Arriving " ,groomsmen:"Arriving"},
      },
    ],
  },
  {
    id: "bridal_party_photoshoot",
    label: "Bridal Party Photoshoot",
    defaultDuration: 15,
    category: "before",
    order: 6.2,
    activities: {
      bride: "Bridal Party Photoshoot",
      groom: "Bridal Party Photoshoot",
      bridesmaids: "Bridal Party Photoshoot",
      groomsmen: "Bridal Party Photoshoot",
    },
  },
  {
    id: "transport_to_mosque",
    label: "Moving to Mosque / Katb Ketab Location",
    defaultDuration: 30,
    category: "before",
    order: 6.5,
    hidden: true,
    showIf: { photoAtKatbLocation: "no" },
    activities: {
      bride: "Moving to Mosque / Katb Ketab Location",
      groom: "Moving to Mosque / Katb Ketab Location",
      bridesmaids: "Moving to Mosque / Katb Ketab Location",
      groomsmen: "Moving to Mosque / Katb Ketab Location",
    },
  },

  {
    id: "Guest_Arrival",
    noBreakBefore: true,
    noBreakAfter: true,
    label: "Guest Arrival",
    defaultDuration: 20,
    category: "before",
    order: 7.8,
    activities: {
      bride: "Guests Arrival/Bridal party break",
      groom: "Guests Arrival/Bridal party break",
      bridesmaids: "Guests Arrival/Bridal party break",
      groomsmen: "Guests Arrival/Bridal party break",
    },
  },
  {
    id: "katb_ketab",
    noBreakAfter: true,
    label: "Katb Ketab",
    defaultDuration: 60,
    category: "before",
    order: 8,
    activities: {
      bride: "Katb Ketab Ceremony",
      groom: "Katb Ketab Ceremony",
      bridesmaids: "Katb Ketab Ceremony",
      groomsmen: "Katb Ketab Ceremony",
    },
  },

  {
    id: "katb_ketab_pictures_greetings",
    label: "Katb Ketab Pictures & Greetings",
    defaultDuration: 60,
    category: "before",
    order: 8.1,
    activities: {
      bride: "Pictures & Greetings",
      groom: "Pictures & Greetings",
      bridesmaids: "Photos",
      groomsmen: "Photos",
    },
  },







];
export const MUSLIM_WEDDING_ONLY_FEATURES: WeddingFeature[] = [
  {
    id: "arrival",
    noBreakAfter: true,
    label: "Arrival at the venue",
    defaultDuration: 15,
    category: "before",
    order: 1,
    hidden: true,
    showIf: { gettingReadyLocation: "venue" },
    activities: {
      bride: "Arrival at the venue",
      groom: "_",
      bridesmaids: "_",
      groomsmen: "_",
    },
    // conditionalActivities: [
    //   {
    //     condition: { bridesmaidsAtPrep: "yes" },
    //     activities: { bridesmaids: "Arrival at the venue" },
    //   },
    // ],
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
    conditionalActivities: [
      {
        condition: { bridesmaidsAtPrep: "no" },
        activities: { bridesmaids: "_" ,groomsmen:"_"},
      },

    ],
  },
  {
    id: "makeup",
    label: "Makeup",
    defaultDuration: 90,
    category: "before",
    order: 3,
    activities: {
      bride: "Makeup",
      groom: "Arriving & Getting Ready",
      bridesmaids: "Arriving & Getting Ready",
      groomsmen: "Arriving & Getting Ready",
    },
    conditionalActivities: [
      {
        condition: { bridesmaidsAtPrep: "no" },
        activities: { bridesmaids: "_" ,groomsmen:"_"},
      },
      {
        condition: { gettingReadyLocation: "home" },
        activities: { groom: "Getting Ready", groomsmen: "Arriving And Getting Ready" },
      },

    ],
  },
  {
    id: "getting_ready",
    label: "Getting ready pictures",
    defaultDuration: 30,
    category: "before",
    order: 4,
    noBreakAfter: true,
    activities: {
      bride: "Getting Ready Photos",
      groom: "Break",
      bridesmaids: "Getting Ready Photos",
      groomsmen: "Break",
    },
    conditionalActivities: [
      {
        condition: { bridesmaidsAtPrep: "no" },
        activities: { bridesmaids: "_" ,groomsmen:"_"},
      },

    ],
  },
  {
    id: "getting_ready_2",
    label: "Getting ready pictures",
    defaultDuration: 30,
    category: "before",
    noBreakAfter:true,
    order: 4.1,
    activities: {
      bride: "Break",
      groom: "Getting Ready Photos",
      bridesmaids: "Break",
      groomsmen: "Getting Ready Photos",
    },
    conditionalActivities: [
      {
        condition: { bridesmaidsAtPrep: "no" },
        activities: { bridesmaids: "_" ,groomsmen:"_"},
      },

    ],
  },
  {
    id: "dress_suit",
    noBreakAfter: true,
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
    conditionalActivities: [
      {
        condition: { bridesmaidsAtPrep: "no" },
        activities: { bridesmaids: "_" ,groomsmen:"_"},
      },

    ],
  },
  // {id:"beforeLeaving",label:"getting ready to leave",defaultDuration:15,category:"before",order:4.6,activities:{bride:"getting ready to leave",groom:"getting ready to leave",bridesmaids:"getting ready to leave",groomsmen:"getting ready to leave"}},
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
    conditionalActivities: [
      {
        condition: { bridesmaidsAtPrep: "no" },
        activities: { bridesmaids: "_" ,groomsmen:"_"},
      },

    ],
  },
  {
    id: "transport_to_photoshoot",
    label: "Heading to the photoshoot",
    defaultDuration: 30,
    category: "before",
    order: 5.5,
    hidden: true,
    showIf: [{ gettingReadyLocation: "home" }, { photoshootLocation: "another_place" }],
    activities: {
      bride: "Heading to the photoshoot",
      groom: "Heading to the photoshoot",
      bridesmaids: "Heading to the photoshoot",
      groomsmen: "Heading to the photoshoot",
    },
    conditionalActivities: [
      {
        condition: { bridesmaidsAtPrep: "no" },
        activities: { bridesmaids: "_" ,groomsmen:"_"},
      },

    ],
  },
  {
    id: "couple_photoshoot",
    label: "Couple Photoshoot",
    defaultDuration: 90,
    category: "before",
    noBreakAfter: true,
    order: 6,
    activities: {
      bride: "Couple Photoshoot",
      groom: "Couple Photoshoot",
      bridesmaids: "Photoshoot Break",
      groomsmen: "Photoshoot Break",
    },
    conditionalActivities: [
      {
        condition: { bridesmaidsAtPrep: "no" },
        activities: { bridesmaids: "" ,groomsmen:""},
      },

    ],
  },
  {
    id: "family_photoshoot",
    label: "Family Photoshoot",
    defaultDuration: 15,
    category: "before",
    noBreakAfter: true,
    order: 6.1,
    activities: {
      bride: "Family Photoshoot",
      groom: "Family Photoshoot",
      bridesmaids: "Photoshoot Break",
      groomsmen: "Photoshoot Break",
    },
    conditionalActivities: [
      {
        condition: { bridesmaidsAtPrep: "no" },
        activities: { bridesmaids: "Arriving " ,groomsmen:"Arriving"},
      },
    ],
  },
  {
    id: "bridal_party_photoshoot",
    label: "Bridal Party Photoshoot",
    defaultDuration: 15,
    category: "before",
    order: 6.2,
    activities: {
      bride: "Bridal Party Photoshoot",
      groom: "Bridal Party Photoshoot",
      bridesmaids: "Bridal Party Photoshoot",
      groomsmen: "Bridal Party Photoshoot",
    },
  },
  {
    id: "transport_to_venue",
    label: "Heading to the venue",
    defaultDuration: 30,
    category: "before",
    order: 6.5,
    hidden: true,
    showIf: { photoshootLocation: "another_place" },
    activities: {
      bride: "Heading to the venue",
      groom: "Heading to the venue",
      bridesmaids: "Heading to the venue",
      groomsmen: "Heading to the venue",
    },
  },
  {
    id: "Guest_Arrival",
    noBreakBefore: true,
    noBreakAfter: true,
    label: "Guest Arrival",
    defaultDuration: 20,
    category: "before",
    order: 7.8,
    activities: {
      bride: "Guests Arrival/Bridal party break",
      groom: "Guests Arrival/Bridal party break",
      bridesmaids: "Guests Arrival/Bridal party break",
      groomsmen: "Guests Arrival/Bridal party break",
    },
  },

  {
    id: "Grand_Entrance",
    noBreakAfter: true,
    label: "Grand Entrance",
    defaultDuration: 10,
    category: "before",
    order: 8.7,
    activities: {
      bride: "Grand Entrance",
      groom: "Grand Entrance",
      bridesmaids: "Grand Entrance",
      groomsmen: "Grand Entrance",
    },
  },



  {
    id: "zaffa",
    noBreakAfter: true,
    label: "Zaffa",
    defaultDuration: 15,
    category: "zaffa",
    order: 9,
    activities: {
      bride: "Zaffa",
      groom: "Zaffa",
      bridesmaids: "Zaffa",
      groomsmen: "Zaffa",
    },
  },
  {
    id: "party_before_dinner",
    label: "Party",
    defaultDuration: 120,
    category: "after",
    order: 9.5,
    hidden: true,
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
    defaultDuration: 90,
    category: "after",
    order: 11,
    hidden: true,
    activities: {
      bride: "Party / Dancing",
      groom: "Party / Dancing",
      bridesmaids: "Party / Dancing",
      groomsmen: "Party / Dancing",
    },
  },
    {
    id: "party_ends",
    label: "Party Ends",
    defaultDuration: 10,
    category: "after",
    order: 12,
    activities: {
      bride: "Party Ends",
      groom: "Party Ends",
      bridesmaids: "Party Ends",
      groomsmen: "Party Ends",
    },
  },
];

export const CHRISTIAN_CHURCH_VENUE_FEATURES: WeddingFeature[] = [
  {
    id: "arrival",
    noBreakAfter: true,
    label: "Arrival at the venue",
    defaultDuration: 15,
    category: "before",
    order: 1,
    hidden: true,
    showIf: { gettingReadyLocation: "venue" },
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
    conditionalActivities: [
      {
        condition: { bridesmaidsAtPrep: "no" },
        activities: { bridesmaids: "_" },
      },
      {
        condition: { gettingReadyLocation: "home" },
        activities: { groom: "", groomsmen: "" },
      },
    ],
  },
  {
    id: "makeup",
    label: "Makeup",
    defaultDuration: 90,
    category: "before",
    order: 3,
    activities: {
      bride: "Makeup",
      groom: "Arriving & Getting Ready",
      bridesmaids: "Arriving & Getting Ready",
      groomsmen: "Arriving & Getting Ready",
    },
    conditionalActivities: [
      {
        condition: { bridesmaidsAtPrep: "yes" },
        activities: { bridesmaids: "Makeup" },
      },
      {
        condition: { gettingReadyLocation: "home", bridesmaidsAtPrep: "yes" },
        activities: {
          groom: "Getting Ready",
          groomsmen: "Arriving to groom's house",
        },
      },
      {
        condition: { gettingReadyLocation: "home", bridesmaidsAtPrep: "no" },
        activities: { groom: "Getting Ready", groomsmen: "_" },
      },
      {
        condition: { bridesmaidsAtPrep: "no" },
        activities: { bridesmaids: "_", groomsmen: "_" },
      },
    ],
  },
  {
    id: "getting_ready",
    label: "Getting ready pictures",
    defaultDuration: 30,
    category: "before",
    order: 4,
    activities: {
      bride: "Getting Ready Photos",
      groom: "Getting Ready Photos",
      bridesmaids: "Getting Ready Photos",
      groomsmen: "Getting Ready Photos",
    },
    conditionalActivities: [
      {
        condition: { bridesmaidsAtPrep: "no" },
        activities: { bridesmaids: "", groomsmen: "" },
      },
    ],
  },
  {
    id: "dress_suit",
    noBreakAfter: true,
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
    conditionalActivities: [
      {
        condition: { bridesmaidsAtPrep: "no" },
        activities: { bridesmaids: "", groomsmen: "" },
      },
    ],
  },
  {
    id: "first_look",
    label: "First look",
    defaultDuration: 15,
    noBreakAfter: true,
    category: "before",
    order: 5,
    activities: {
      bride: "First Look",
      groom: "First Look",
      bridesmaids: "cheering the couple up",
      groomsmen: "cheering the couple up",
    },
    conditionalActivities: [
      {
        condition: { bridesmaidsAtPrep: "no" },
        activities: { bridesmaids: "_", groomsmen: "_" },
      },
    ],
  },
  {
    id: "beforeLeaving",
    label: "getting ready to leave",
    defaultDuration: 15,
    category: "before",
    order: 5.1,
    activities: {
      bride: "getting ready to leave",
      groom: "getting ready to leave",
      bridesmaids: "getting ready to leave",
      groomsmen: "getting ready to leave",
    },
    conditionalActivities: [
      {
        condition: { bridesmaidsAtPrep: "no" },
        activities: { bridesmaids: "_", groomsmen: "_" },
      },
    ],
  },
  {
    id: "transport_to_photoshoot",
    label: "Moving to Photoshoot Location",
    defaultDuration: 30,
    category: "before",
    order: 5.2,
    hidden: true,
    showIf: { photoshootTiming: "before" },
    activities: {
      bride: "Moving to Photoshoot Location",
      groom: "Moving to Photoshoot Location",
      bridesmaids: "Moving to Photoshoot Location",
      groomsmen: "Moving to Photoshoot Location",
    },
  },
  {
    id: "couple_photoshoot",
    label: "Couple Photoshoot",
    defaultDuration: 90,
    category: "before",
    noBreakAfter: true,
    order: 6,
    showIf: { photoshootTiming: "before" },
    activities: {
      bride: "Couple Photoshoot",
      groom: "Couple Photoshoot",
      bridesmaids: "Photoshoot Break",
      groomsmen: "Photoshoot Break",
    },
    conditionalActivities: [
      {
        condition: { bridesmaidsAtPrep: "no" },
        activities: { bridesmaids: "" ,groomsmen:""},
      },
    ],
  },
  {
    id: "family_photoshoot",
    label: "Family Photoshoot",
    defaultDuration: 15,
    category: "before",
    noBreakAfter: true,
    order: 6.1,
    showIf: { photoshootTiming: "before" },
    activities: {
      bride: "Family Photoshoot",
      groom: "Family Photoshoot",
      bridesmaids: "Photoshoot Break",
      groomsmen: "Photoshoot Break",
    },
    conditionalActivities: [
      {
        condition: { bridesmaidsAtPrep: "no" },
        activities: { bridesmaids: "Arriving " ,groomsmen:"Arriving"},
      },
    ],
  },
  {
    id: "bridal_party_photoshoot",
    label: "Bridal Party Photoshoot",
    defaultDuration: 15,
    category: "before",
    order: 6.2,
    showIf: { photoshootTiming: "before" },
    activities: {
      bride: "Bridal Party Photoshoot",
      groom: "Bridal Party Photoshoot",
      bridesmaids: "Bridal Party Photoshoot",
      groomsmen: "Bridal Party Photoshoot",
    },
  },
  {
    id: "moving_to_church",
    noBreakAfter: true,
    label: "Moving to Church",
    defaultDuration: 30,
    category: "before",
    order: 7.5,
    activities: {
      bride: "Heading to Church / Guest Arrival",
      groom: "Heading to Church / Guest Arrival",
      bridesmaids: "Heading to Church / Guest Arrival",
      groomsmen: "Heading to Church / Guest Arrival",
    },
  },
  {
    id: "Guest_Arrival",
    noBreakBefore: true,
    noBreakAfter: true,
    label: "Guest Arrival",
    defaultDuration: 20,
    category: "before",
    order: 7.8,
    activities: {
      bride: "Guests Arrival/Bridal party break",
      groom: "Guests Arrival/Bridal party break",
      bridesmaids: "Guests Arrival/Bridal party break",
      groomsmen: "Guests Arrival/Bridal party break",
    },
  },
  {
    id: "church",
    noBreakAfter: true,
    label: "Church Ceremony",
    defaultDuration: 60,
    category: "before",
    order: 8,
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
    activities: {
      bride: "Salamat & Photos",
      groom: "Salamat & Photos",
      bridesmaids: "Salamat & Photos",
      groomsmen: "Salamat & Photos",
    },
  },
  {
    id: "transport_to_photoshoot_after",
    label: "Moving to Photoshoot Location",
    defaultDuration: 30,
    category: "after",
    order: 8.25,
    hidden: true,
    showIf: { photoshootTiming: "after" },
    activities: {
      bride: "Moving to Photoshoot Location",
      groom: "Moving to Photoshoot Location",
      bridesmaids: "Moving to Photoshoot Location",
      groomsmen: "Moving to Photoshoot Location",
    },
  },
  {
    id: "couple_photoshoot_after",
    label: "Couple Photoshoot",
    defaultDuration: 90,
    category: "after",
    noBreakAfter: true,
    order: 8.3,
    showIf: { photoshootTiming: "after" },
    activities: {
      bride: "Couple Photoshoot",
      groom: "Couple Photoshoot",
      bridesmaids: "Photoshoot Break",
      groomsmen: "Photoshoot Break",
    },
    conditionalActivities: [
      {
        condition: { bridesmaidsAtPrep: "no" },
        activities: { bridesmaids: "" ,groomsmen:""},
      },
    ],
  },
  {
    id: "family_photoshoot_after",
    label: "Family Photoshoot",
    defaultDuration: 15,
    category: "after",
    noBreakAfter: true,
    order: 8.31,
    showIf: { photoshootTiming: "after" },
    activities: {
      bride: "Family Photoshoot",
      groom: "Family Photoshoot",
      bridesmaids: "Photoshoot Break",
      groomsmen: "Photoshoot Break",
    },
    conditionalActivities: [
      {
        condition: { bridesmaidsAtPrep: "no" },
        activities: { bridesmaids: "Arriving " ,groomsmen:"Arriving"},
      },
    ],
  },
  {
    id: "bridal_party_photoshoot_after",
    label: "Bridal Party Photoshoot",
    defaultDuration: 15,
    category: "after",
    order: 8.32,
    showIf: { photoshootTiming: "after" },
    activities: {
      bride: "Bridal Party Photoshoot",
      groom: "Bridal Party Photoshoot",
      bridesmaids: "Bridal Party Photoshoot",
      groomsmen: "Bridal Party Photoshoot",
    },
  },
  {
    id: "moving_to_venue",
    noBreakAfter: true,
    label: "Moving to Venue",
    defaultDuration: 30,
    category: "after",
    order: 8.5,
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
    activities: {
      bride: "Freshening Up",
      groom: "Freshening Up",
      bridesmaids: "Helping Bride",
      groomsmen: "Helping Groom",
    },
  },
  {
    id: "Grand_Entrance",
    noBreakAfter: true,
    label: "Grand Entrance",
    defaultDuration: 10,
    category: "zaffa",
    order: 8.7,
    activities: {
      bride: "Grand Entrance",
      groom: "Grand Entrance",
      bridesmaids: "Grand Entrance",
      groomsmen: "Grand Entrance",
    },
  },
  {
    id: "party_before_dinner",
    label: "Party",
    defaultDuration: 90,
    category: "after",
    order: 9.5,
    hidden: true,
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
    activities: {
      bride: "Party / Dancing",
      groom: "Party / Dancing",
      bridesmaids: "Party / Dancing",
      groomsmen: "Party / Dancing",
    },
  },
  {
    id: "party_ends",
    label: "Party Ends",
    defaultDuration: 10,
    category: "after",
    order: 12,
    activities: {
      bride: "Party Ends",
      groom: "Party Ends",
      bridesmaids: "Party Ends",
      groomsmen: "Party Ends",
    },
  },
];

export const CHRISTIAN_CHURCH_ONLY_FEATURES: WeddingFeature[] = [
  {
    id: "arrival",
    noBreakAfter: true,
    label: "Arrival at the venue",
    defaultDuration: 15,
    category: "before",
    order: 1,
    hidden: true,
    showIf: { gettingReadyLocation: "venue" },
    activities: {
      bride: "Arrival at the venue",
      groom: "_",
      bridesmaids: "_",
      groomsmen: "_",
    },
    // conditionalActivities: [
    //   {
    //     condition: { bridesmaidsAtPrep: "yes" },
    //     activities: { bridesmaids: "Arrival at the venue" },
    //   },
    // ],
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
      bridesmaids: "Hair Styling",
      groomsmen: "_",
    },
    conditionalActivities: [
      {
        condition: { bridesmaidsAtPrep: "no" },
        activities: { bridesmaids: "_" },
      },
    ],
  },
  {
    id: "makeup",
    label: "Makeup",
    defaultDuration: 90,
    category: "before",
    order: 3,
    activities: {
      bride: "Makeup",
      groom: "Getting Ready",
      bridesmaids: "",
      groomsmen: "",
    },
    conditionalActivities: [
      {
        condition: { bridesmaidsAtPrep: "yes" },
        activities: { bridesmaids: "Makeup" ,groomsmen:"arriving to groom's house"},
      },
      {
        condition: { bridesmaidsAtPrep: "no" },
        activities: { bridesmaids: "_",groomsmen: "_" },
      },
    ],
  },
  {
    id: "getting_ready_church",
    label: "Getting ready pictures",
    defaultDuration: 30,
    category: "before",
    noBreakAfter:true,
    order: 4.1,
    activities: {
      bride: "Getting Ready Photos",
      groom: "Getting Ready Photos",
      bridesmaids: "Getting Ready Photos",
      groomsmen: "Getting Ready Photos",
    },
    conditionalActivities: [
      {
        condition: { bridesmaidsAtPrep: "no" },
        activities: { bridesmaids: "_" ,groomsmen:"_"},
      },
    ],
  },
  {
    id: "dress_suit",
    noBreakAfter: true,
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
    conditionalActivities: [
      {
        condition: { bridesmaidsAtPrep: "no" },
        activities: { bridesmaids: "",groomsmen: "" },
      },
    ],
  },

  {id:"beforeLeaving",label:"getting ready to leave",defaultDuration:15,category:"before",order:4.6,activities:{bride:"getting ready to leave",groom:"getting ready to leave",bridesmaids:"getting ready to leave",groomsmen:"getting ready to leave"}
,
    conditionalActivities: [
      {
        condition: { bridesmaidsAtPrep: "no" },
        activities: { bridesmaids: "_",groomsmen: "_" },
      },
    ],
  },
  {
    id: "picking_up_bride",
    label: "Picking up the bride",
    defaultDuration: 30,
    category: "before",
    order: 4.7,
    noBreakAfter: true,
    showIf: { gettingReadyLocation: "home" },
    activities: {
      bride: "bride only pictures",
      groom: "Picking up the bride",
      bridesmaids: "Celebrating",
      groomsmen: "Celebrating",
    },
        conditionalActivities: [
      {
        condition: { bridesmaidsAtPrep: "no" },
        activities: { bridesmaids: "",groomsmen: "" },
      },
    ],
  },
  {
    id: "first_look",
    label: "First look",
    defaultDuration: 15,
    category: "before",
    order: 4.8,
    noBreakAfter: true,
    showIf: { gettingReadyLocation: "home" },
    activities: {
      bride: "First Look",
      groom: "First Look",
      bridesmaids: "cheering the couple up",
      groomsmen: "cheering the couple up",
    },
            conditionalActivities: [
      {
        condition: { bridesmaidsAtPrep: "no" },
        activities: { bridesmaids: "",groomsmen: "" },
      },
    ],
  },
{id:"transport_to_church",label:"transport to church",
  defaultDuration:30,category:"before",order:4.85,
  showIf:{photoshootTiming:"after"},
  activities:{bride:"Moving to church",groom:"Moving to church",bridesmaids:"Moving to church",groomsmen:"Moving to church"},
  conditionalActivities:[{condition:{bridesmaidsAtPrep:"no"},
    activities:{bridesmaids:"",groomsmen:""}}]},
  {
    id: "transport_to_photoshoot",
    label: "Moving to Photoshoot Location",
    defaultDuration: 30,
    category: "before",
    order: 4.9,
    hidden: true,
    showIf: { gettingReadyLocation: "home", photoshootTiming: "before" },
    activities: {
      bride: "Moving to Photoshoot Location",
      groom: "Moving to Photoshoot Location",
      bridesmaids: "Moving to Photoshoot Location",
      groomsmen: "Moving to Photoshoot Location",
    },
    conditionalActivities:[
      {
        condition: { bridesmaidsAtPrep: "no" },
        activities: { bridesmaids: "",groomsmen: "" },
      },
    ]
  },

  {
    id: "couple_photoshoot",
    label: "Couple Photoshoot",
    defaultDuration: 90,
    category: "before",
    noBreakAfter: true,
    order: 6,
    showIf: { photoshootTiming: "before" },
    activities: {
      bride: "Couple Photoshoot",
      groom: "Couple Photoshoot",
      bridesmaids: "Photoshoot Break",
      groomsmen: "Photoshoot Break",
    },
    conditionalActivities: [
      {
        condition: { bridesmaidsAtPrep: "no" },
        activities: { bridesmaids: "" ,groomsmen:""},
      },
    ],
  },
  {
    id: "family_photoshoot",
    label: "Family Photoshoot",
    defaultDuration: 15,
    category: "before",
    noBreakAfter: true,
    order: 6.1,
    showIf: { photoshootTiming: "before" },
    activities: {
      bride: "Family Photoshoot",
      groom: "Family Photoshoot",
      bridesmaids: "Photoshoot Break",
      groomsmen: "Photoshoot Break",
    },
    conditionalActivities: [
      {
        condition: { bridesmaidsAtPrep: "no" },
        activities: { bridesmaids: "Arriving " ,groomsmen:"Arriving"},
      },
    ],
  },
  {
    id: "bridal_party_photoshoot",
    label: "Bridal Party Photoshoot",
    defaultDuration: 15,
    category: "before",
    order: 6.2,
    showIf: { photoshootTiming: "before" },
    activities: {
      bride: "Bridal Party Photoshoot",
      groom: "Bridal Party Photoshoot",
      bridesmaids: "Bridal Party Photoshoot",
      groomsmen: "Bridal Party Photoshoot",
    },
  },
  {
    id: "transport_to_church",
    label: "Moving to church",
    defaultDuration: 30,
    category: "before",
    order: 6.5,
    hidden: true,
    showIf: { photoshootTiming: "before" },
    activities: {
      bride: "Moving to church",
      groom: "Moving to church",
      bridesmaids: "Moving to church",
      groomsmen: "Moving to church",
    },
  },

  {
    id: "Guest_Arrival",
    noBreakBefore: true,
    noBreakAfter: true,
    label: "Guest Arrival",
    defaultDuration: 20,
    category: "before",
    order: 7.8,
    activities: {
      bride: "Guests Arrival/Bridal party break",
      groom: "Guests Arrival/Bridal party break",
      bridesmaids: "Guests Arrival/Bridal party break",
      groomsmen: "Guests Arrival/Bridal party break",
    },
    conditionalActivities:[
      {
        condition: { bridesmaidsAtPrep: "no",photoshootTiming: "after" },
        activities: { bridesmaids: "arriving",groomsmen: "arriving" },
      },
    ]
  },
  
  
  
  {
    id: "church",
    noBreakAfter: true,
    label: "Church Ceremony",
    defaultDuration: 60,
    category: "zaffa",
    order: 8,
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
    id: "transport_to_photoshoot_after",
    label: "Moving to Photoshoot Location",
    defaultDuration: 30,
    category: "after",
    order: 8.25,
    hidden: true,
    showIf: { photoshootTiming: "after" },
    activities: {
      bride: "Moving to Photoshoot Location",
      groom: "Moving to Photoshoot Location",
      bridesmaids: "Moving to Photoshoot Location",
      groomsmen: "Moving to Photoshoot Location",
    },
  },
    {
    id: "couple_photoshoot_after",
    label: "Couple Photoshoot",
    defaultDuration: 90,
    category: "after",
    order: 8.3,
    noBreakAfter: true,
    showIf: { photoshootTiming: "after" },
    activities: {
      bride: "Couple Photoshoot",
      groom: "Couple Photoshoot",
      bridesmaids: "Photoshoot Break",
      groomsmen: "Photoshoot Break",
    },

  },
  {
    id: "family_photoshoot_after",
    label: "Family Photoshoot",
    defaultDuration: 15,
    category: "after",
    order: 8.31,
    noBreakAfter: true,
    showIf: { photoshootTiming: "after" },
    activities: {
      bride: "Family Photoshoot",
      groom: "Family Photoshoot",
      bridesmaids: "Photoshoot Break",
      groomsmen: "Photoshoot Break",
    },
  },
  {
    id: "bridal_party_photoshoot_after",
    label: "Bridal Party Photoshoot",
    defaultDuration: 15,
    category: "after",
    order: 8.32,
    showIf: { photoshootTiming: "after" },
    activities: {
      bride: "Bridal Party Photoshoot",
      groom: "Bridal Party Photoshoot",
      bridesmaids: "Bridal Party Photoshoot",
      groomsmen: "Bridal Party Photoshoot",
    },
  },


];

export const CHRISTIAN_VENUE_ONLY_FEATURES: WeddingFeature[] = [
  {
    id: "arrival",
    noBreakAfter: true,
    label: "Arrival at the venue",
    defaultDuration: 15,
    category: "before",
    order: 1,
    hidden: true,
    showIf: { gettingReadyLocation: "venue" },
    activities: {
      bride: "Arrival at the venue",
      groom: "_",
      bridesmaids: "_",
      groomsmen: "_",
    },
    // conditionalActivities: [
    //   {
    //     condition: { bridesmaidsAtPrep: "yes" },
    //     activities: { bridesmaids: "Arrival at the venue" },
    //   },
    // ],
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
      bridesmaids: "Hair Styling",
      groomsmen: "_",
    },
    conditionalActivities: [
      {
        condition: { bridesmaidsAtPrep: "no" },
        activities: { bridesmaids: "_" ,groomsmen:"_"},
      },],
  },
  {
    id: "makeup",
    label: "Makeup",
    defaultDuration: 90,
    category: "before",
    order: 3,
    activities: {
      bride: "Makeup",
      groom: "Arriving & Getting Ready",
      bridesmaids: "Arriving & Getting Ready",
      groomsmen: "Arriving & Getting Ready",
    },
    conditionalActivities: [
      {
        condition: { bridesmaidsAtPrep: "no" },
        activities: { bridesmaids: "_" ,groomsmen:"_"},
      },

    ],
  },
 {
    id: "getting_ready",
    label: "Getting ready pictures",
    defaultDuration: 30,
    category: "before",
    order: 4,
    noBreakAfter: true,
    activities: {
      bride: "Getting Ready Photos",
      groom: "Break",
      bridesmaids: "Getting Ready Photos",
      groomsmen: "Break",
    },
    conditionalActivities: [
      {
        condition: { bridesmaidsAtPrep: "no" },
        activities: { bridesmaids: "_" ,groomsmen:"_"},
      },

    ],
  },
  {
    id: "getting_ready_2",
    label: "Getting ready pictures",
    defaultDuration: 30,
    category: "before",
    noBreakAfter:true,
    order: 4.1,
    activities: {
      bride: "Break",
      groom: "Getting Ready Photos",
      bridesmaids: "Break",
      groomsmen: "Getting Ready Photos",
    },
    conditionalActivities: [
      {
        condition: { bridesmaidsAtPrep: "no" },
        activities: { bridesmaids: "_" ,groomsmen:"_"},
      },

    ],
  },

 {
    id: "dress_suit",
    noBreakAfter: true,
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
    conditionalActivities: [
      {
        condition: { bridesmaidsAtPrep: "no" },
        activities: { bridesmaids: "_" ,groomsmen:"_"},
      },

    ],
  },

  // {id:"beforeLeaving",label:"getting ready to leave",defaultDuration:15,category:"before",order:4.6,activities:{bride:"getting ready to leave",groom:"getting ready to leave",bridesmaids:"getting ready to leave",groomsmen:"getting ready to leave"}},

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
    conditionalActivities: [
      {
        condition: { bridesmaidsAtPrep: "no" },
        activities: { bridesmaids: "_" ,groomsmen:"_"},
      },

    ],
  },
  {
    id: "transport_to_photoshoot",
    label: "Heading to the photoshoot",
    defaultDuration: 30,
    category: "before",
    order: 5.5,
    hidden: true,
    showIf: [{ gettingReadyLocation: "home" }, { photoshootLocation: "another_place" }],
    activities: {
      bride: "Heading to the photoshoot",
      groom: "Heading to the photoshoot",
      bridesmaids: "Heading to the photoshoot",
      groomsmen: "Heading to the photoshoot",
    },
    conditionalActivities: [
      {
        condition: { bridesmaidsAtPrep: "no" },
        activities: { bridesmaids: "_" ,groomsmen:"_"},
      },

    ],
  },

  {
    id: "couple_photoshoot",
    label: "Couple Photoshoot",
    defaultDuration: 90,
    category: "before",
    noBreakAfter: true,
    order: 6,
    activities: {
      bride: "Couple Photoshoot",
      groom: "Couple Photoshoot",
      bridesmaids: "Photoshoot Break",
      groomsmen: "Photoshoot Break",
    },
    conditionalActivities: [
      {
        condition: { bridesmaidsAtPrep: "no" },
        activities: { bridesmaids: "" ,groomsmen:""},
      },
    ],
  },
  {
    id: "family_photoshoot",
    label: "Family Photoshoot",
    defaultDuration: 15,
    category: "before",
    noBreakAfter: true,
    order: 6.1,
    activities: {
      bride: "Family Photoshoot",
      groom: "Family Photoshoot",
      bridesmaids: "Photoshoot Break",
      groomsmen: "Photoshoot Break",
    },
    conditionalActivities: [
      {
        condition: { bridesmaidsAtPrep: "no" },
        activities: { bridesmaids: "Arriving " ,groomsmen:"Arriving"},
      },
    ],
  },
  {
    id: "bridal_party_photoshoot",
    label: "Bridal Party Photoshoot",
    defaultDuration: 15,
    category: "before",
    order: 6.2,
    activities: {
      bride: "Bridal Party Photoshoot",
      groom: "Bridal Party Photoshoot",
      bridesmaids: "Bridal Party Photoshoot",
      groomsmen: "Bridal Party Photoshoot",
    },

    },
  {
    id: "transport_to_venue",
    label: "Heading to the venue",
    defaultDuration: 30,
    category: "before",
    order: 6.5,
    hidden: true,
    showIf: { photoshootLocation: "another_place" },
    activities: {
      bride: "Heading to the venue",
      groom: "Heading to the venue",
      bridesmaids: "Heading to the venue",
      groomsmen: "Heading to the venue",
    },
  },

  {
    id: "Guest_Arrival",
    noBreakBefore: true,
    noBreakAfter: true,
    label: "Guest Arrival",
    defaultDuration: 20,
    category: "before",
    order: 7.8,
    activities: {
      bride: "Guests Arrival/Bridal party break",
      groom: "Guests Arrival/Bridal party break",
      bridesmaids: "Guests Arrival/Bridal party break",
      groomsmen: "Guests Arrival/Bridal party break",
    },
  },

  
  


  {
    id: "Grand_Entrance",
    noBreakAfter: true,
    label: "Grand Entrance",
    defaultDuration: 10,
    category: "before",
    order: 8.7,
    activities: {
      bride: "Grand Entrance",
      groom: "Grand Entrance",
      bridesmaids: "Grand Entrance",
      groomsmen: "Grand Entrance",
    },
  },


  {
    id: "party_before_dinner",
    label: "Party",
    defaultDuration: 120,
    category: "after",
    order: 9.5,
    hidden: true,
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

    activities: {
      bride: "Party / Dancing",
      groom: "Party / Dancing",
      bridesmaids: "Party / Dancing",
      groomsmen: "Party / Dancing",
    },
  },
    {
    id: "party_ends",
    label: "Party Ends",
    defaultDuration: 10,
    category: "after",
    order: 12,
    activities: {
      bride: "Party Ends",
      groom: "Party Ends",
      bridesmaids: "Party Ends",
      groomsmen: "Party Ends",
    },
  },];

export const FEATURES_BY_VARIATION: Record<CeremonyVariation, WeddingFeature[]> = {
  muslim_katb_ketab_wedding: MUSLIM_KATB_KETAB_WEDDING_FEATURES,
  muslim_katb_ketab_only: MUSLIM_KATB_KETAB_ONLY_FEATURES,
  muslim_wedding_only: MUSLIM_WEDDING_ONLY_FEATURES,
  christian_church_venue: CHRISTIAN_CHURCH_VENUE_FEATURES,
  christian_church_only: CHRISTIAN_CHURCH_ONLY_FEATURES,
  christian_venue_only: CHRISTIAN_VENUE_ONLY_FEATURES,
};

export const ALL_FEATURES = Object.values(FEATURES_BY_VARIATION)
  .flat()
  .filter((feat, index, self) => index === self.findIndex((t) => t.id === feat.id));
