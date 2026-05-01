// Observation tree: Subject -> Activities -> Sub-activities
// Built initially from program plan SUBJECT_TREE but flattened per spec.

export const OBSERVATION_TREE = {
  "practical-life": {
    label: "Practical Life",
    activities: {
      "room-etiquette": {
        label: "Room etiquette",
        subActivities: ["Greeting peers", "Walking on the line", "Quiet voices"],
      },
      "preliminary-movement": {
        label: "Preliminary and elementary movement",
        subActivities: ["Carrying a tray", "Rolling a mat", "Pushing in a chair"],
      },
      "care-of-self": {
        label: "Care of self",
        subActivities: ["Polishing shoes", "Washing and drying hands", "Dressing frames", "Dressing activities: Coat"],
      },
      "care-of-environment": {
        label: "Care of the environment",
        subActivities: ["Table washing", "Sweeping", "Polishing wood"],
      },
      "social-grace": {
        label: "Social skills, Grace and Courtesy",
        subActivities: ["Saying please/thank you", "Offering help", "Waiting turns"],
      },
      "preliminary-activities": {
        label: "Preliminary Activities",
        subActivities: ["Spooning beans", "Pouring water", "Threading beads"],
      },
      "pouring-activity": {
        label: "Pouring Activity",
        subActivities: ["Jug to jug", "Jug to glasses", "Funnel pouring"],
      },
      "transferring-activity": {
        label: "Transferring Activity",
        subActivities: ["Tongs transfer", "Tweezers transfer", "Eye dropper transfer"],
      },
      "opening-closing": {
        label: "Opening & Closing",
        subActivities: ["Bottles & lids", "Locks & keys", "Boxes"],
      },
      "cutting-fruits": {
        label: "Cutting fruits with wooden knife",
        subActivities: ["Banana slicing", "Strawberry slicing", "Apple wedges"],
      },
    },
  },
  sensorial: {
    label: "Sensorial",
    activities: {
      visual: { label: "Visual", subActivities: ["Pink Tower", "Brown Stair", "Red Rods", "Colour Boxes"] },
      tactile: { label: "Tactile", subActivities: ["Rough & Smooth Boards", "Fabric Box", "Thermic Tablets"] },
      auditory: { label: "Auditory", subActivities: ["Sound Cylinders", "Bells"] },
      olfactory: { label: "Olfactory & Gustatory", subActivities: ["Smelling Bottles", "Tasting Cups"] },
    },
  },
  math: {
    label: "Maths",
    activities: {
      "numbers-1-10": { label: "Numbers 1–10", subActivities: ["Number Rods", "Sandpaper Numerals", "Spindle Box"] },
      "decimal-system": { label: "Decimal System", subActivities: ["Golden Beads Intro", "Bank Game", "Stamp Game"] },
      operations: { label: "Operations", subActivities: ["Addition Strip Board", "Subtraction Snake Game", "Multiplication Bead Bars"] },
    },
  },
  language: {
    label: "Language",
    activities: {
      "spoken-language": { label: "Spoken Language", subActivities: ["Storytelling", "Vocabulary Cards", "Poetry Time"] },
      "written-language": { label: "Written Language", subActivities: ["Sandpaper Letters", "Movable Alphabet", "Metal Insets"] },
      reading: { label: "Reading", subActivities: ["Pink Series", "Blue Series", "Green Series"] },
    },
  },
  cultural: {
    label: "Cultural",
    activities: {
      geography: { label: "Geography", subActivities: ["Continent Globe", "Sandpaper Globe", "Land & Water Forms"] },
      botany: { label: "Botany", subActivities: ["Parts of a Plant", "Leaf Cabinet", "Planting Seeds"] },
      zoology: { label: "Zoology", subActivities: ["Animal Classification", "Parts of a Fish", "Life Cycles"] },
      history: { label: "History", subActivities: ["Time Line of Day", "Calendar Work", "Birthday Celebration"] },
    },
  },
};

export const slugify = (s) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");