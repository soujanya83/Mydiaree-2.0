// Mock data for Program Plan subjects and activities

export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export const YEARS = [2024, 2025, 2026, 2027];

// Montessori-style subject hierarchy. Each subject has a tree of activity groups -> activities.
export const SUBJECT_TREE = {
  "practical-life": {
    label: "Practical Life",
    groups: [
      {
        label: "Practical Life (Montessori)",
        children: [
          { label: "Room etiquette", items: ["Greeting peers", "Walking on the line", "Quiet voices"] },
          { label: "Preliminary and elementary movement", items: ["Carrying a tray", "Rolling a mat", "Pushing in a chair"] },
          { label: "Care of self", items: ["Hand washing", "Buttoning frame", "Tying shoes"] },
          { label: "Care of the environment", items: ["Table washing", "Sweeping", "Polishing wood"] },
          { label: "Social skills, Grace and Courtesy", items: ["Saying please/thank you", "Offering help", "Waiting turns"] },
          { label: "Preliminary Activities", items: ["Spooning beans", "Pouring water", "Threading beads"] },
          { label: "Pouring Activity", items: ["Jug to jug", "Jug to glasses", "Funnel pouring"] },
          { label: "Transferring Activity", items: ["Tongs transfer", "Tweezers transfer", "Eye dropper transfer"] },
          { label: "Opening & Closing", items: ["Bottles & lids", "Locks & keys", "Boxes"] },
          { label: "Cutting fruits with wooden knife", items: ["Banana slicing", "Strawberry slicing", "Apple wedges"] },
        ],
      },
    ],
  },
  sensorial: {
    label: "Sensorial",
    groups: [
      {
        label: "Sensorial Materials",
        children: [
          { label: "Visual", items: ["Pink Tower", "Brown Stair", "Red Rods", "Colour Boxes"] },
          { label: "Tactile", items: ["Rough & Smooth Boards", "Fabric Box", "Thermic Tablets"] },
          { label: "Auditory", items: ["Sound Cylinders", "Bells"] },
          { label: "Olfactory & Gustatory", items: ["Smelling Bottles", "Tasting Cups"] },
        ],
      },
    ],
  },
  math: {
    label: "Math",
    groups: [
      {
        label: "Mathematics",
        children: [
          { label: "Numbers 1–10", items: ["Number Rods", "Sandpaper Numerals", "Spindle Box"] },
          { label: "Decimal System", items: ["Golden Beads Intro", "Bank Game", "Stamp Game"] },
          { label: "Operations", items: ["Addition Strip Board", "Subtraction Snake Game", "Multiplication Bead Bars"] },
        ],
      },
    ],
  },
  language: {
    label: "Language",
    groups: [
      {
        label: "Language",
        children: [
          { label: "Spoken Language", items: ["Storytelling", "Vocabulary Cards", "Poetry Time"] },
          { label: "Written Language", items: ["Sandpaper Letters", "Movable Alphabet", "Metal Insets"] },
          { label: "Reading", items: ["Pink Series", "Blue Series", "Green Series"] },
        ],
      },
    ],
  },
  culture: {
    label: "Culture",
    groups: [
      {
        label: "Cultural Studies",
        children: [
          { label: "Geography", items: ["Continent Globe", "Sandpaper Globe", "Land & Water Forms"] },
          { label: "Botany", items: ["Parts of a Plant", "Leaf Cabinet", "Planting Seeds"] },
          { label: "Zoology", items: ["Animal Classification", "Parts of a Fish", "Life Cycles"] },
          { label: "History", items: ["Time Line of Day", "Calendar Work", "Birthday Celebration"] },
        ],
      },
    ],
  },
};

export const EYLF_OUTCOMES = [
  { code: "1.1", label: "Children feel safe, secure and supported" },
  { code: "1.2", label: "Children develop their emerging autonomy, inter-dependence, resilience and agency" },
  { code: "1.3", label: "Children develop knowledgeable and confident self-identities" },
  { code: "1.4", label: "Children learn to interact in relation to others with care, empathy and respect" },
  { code: "2.1", label: "Children develop a sense of belonging to groups and communities" },
  { code: "2.2", label: "Children respond to diversity with respect" },
  { code: "2.3", label: "Children become aware of fairness" },
  { code: "2.4", label: "Children become socially responsible and show respect for the environment" },
  { code: "3.1", label: "Children become strong in their social, emotional and spiritual wellbeing" },
  { code: "3.2", label: "Children take increasing responsibility for their own health and physical wellbeing" },
  { code: "4.1", label: "Children develop dispositions for learning such as curiosity, cooperation and confidence" },
  { code: "4.2", label: "Children develop a range of skills and processes such as problem solving and inquiry" },
  { code: "4.3", label: "Children transfer and adapt what they have learned from one context to another" },
  { code: "4.4", label: "Children resource their own learning through connecting with people, place, technologies and natural and processed materials" },
  { code: "5.1", label: "Children interact verbally and non-verbally with others for a range of purposes" },
  { code: "5.2", label: "Children engage with a range of texts and gain meaning from these texts" },
  { code: "5.3", label: "Children express ideas and make meaning using a range of media" },
  { code: "5.4", label: "Children begin to understand how symbols and pattern systems work" },
  { code: "5.5", label: "Children use information and communication technologies" },
];

export const EDUCATORS = [
  "Deepti Sharma",
  "Sarah Lee",
  "Mia Chen",
  "Daniel Park",
  "Priya Nair",
  "Aarav Mehta",
];

// Subject keys that show "Select Activities" instead of rich text
export const ACTIVITY_SUBJECTS = ["practical-life", "sensorial", "math", "language", "culture"];

// Rich-text subjects below the activity ones
export const RICH_SUBJECTS = [
  { key: "artCraft", label: "Art & Craft", placeholder: "Art & Craft" },
];

export const ADDITIONAL_FIELDS = [
  { key: "outdoor", label: "Outdoor Experiences", placeholder: "1st Experiences, 2nd Experiences, 3rd Experiences etc..." },
  { key: "inquiry", label: "Inquiry Topic" },
  { key: "sustainability", label: "Sustainability Topic" },
  { key: "specialEvents", label: "Special Events", placeholder: "14th March - Holi, 18th March - Global Recycling Day..." },
  { key: "childrenVoices", label: "Children's Voices" },
  { key: "familiesInput", label: "Families Input" },
  { key: "groupExperience", label: "Group Experience" },
  { key: "spontaneous", label: "Spontaneous Experience" },
  { key: "mindfulness", label: "Mindfulness Experiences" },
  { key: "whatIsWorking", label: "What is working", placeholder: "Describe what is working well..." },
  { key: "whatIsNotWorking", label: "What is not working", placeholder: "Describe what is not working..." },
];