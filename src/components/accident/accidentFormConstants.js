/** Display labels for nature checkboxes — must match paper form exactly */
export const NATURE_OPTIONS = [
  "Abrasion/ Scrape",
  "Electric Shock",
  "Allergic Reaction",
  "High Temperature",
  "Amputation",
  "Infectious Disease (inc gastrointestinal):",
  "Anaphylaxis",
  "Ingestion/ Inhalation/ Insertion",
  "Asthma/ Respiratory",
  "Internal Injury/ Infection",
  "Bite Wound",
  "Poisoning",
  "Broken Bone/ Fracture/ Dislocation",
  "Rash",
  "Burn/ Sunburn",
  "Respiratory",
  "Choking",
  "Seizure/ Unconscious/ Convulsion",
  "Concussion",
  "Sprain/ Swelling",
  "Crush/ Jam",
  "Stabbing/ Piercing",
  "Cut/ Open Wound",
  "Tooth",
  "Drowning (nonfatal):",
  "Venomous Bite/ Sting",
  "Eye Injury:",
  "Other (Please specify):",
];

/** Maps display label → API field name for save/load */
export const NATURE_API_MAP = {
  "Abrasion/ Scrape": "abrasion",
  "Electric Shock": "electric_shock",
  "Allergic Reaction": "allergic_reaction",
  "High Temperature": "high_temperature",
  Amputation: "amputation",
  "Infectious Disease (inc gastrointestinal):": "infectious_disease",
  Anaphylaxis: "anaphylaxis",
  "Ingestion/ Inhalation/ Insertion": "ingestion",
  "Asthma/ Respiratory": "asthma",
  "Internal Injury/ Infection": "internal_injury",
  "Bite Wound": "bite_wound",
  Poisoning: "poisoning",
  "Broken Bone/ Fracture/ Dislocation": "broken_bone",
  Rash: "rash",
  "Burn/ Sunburn": "burn",
  Respiratory: "respiratory",
  Choking: "choking",
  "Seizure/ Unconscious/ Convulsion": "seizure",
  Concussion: "concussion",
  "Sprain/ Swelling": "sprain",
  "Crush/ Jam": "crush",
  "Stabbing/ Piercing": "stabbing",
  "Cut/ Open Wound": "cut",
  Tooth: "tooth",
  "Drowning (nonfatal):": "drowning",
  "Venomous Bite/ Sting": "venomous_bite",
  "Eye Injury:": "eye_injury",
  "Other (Please specify):": "other",
};

export const NATURE_API_KEYS = Object.values(NATURE_API_MAP);

export function natureLabelsFromApiRecord(record) {
  return NATURE_OPTIONS.filter((label) => record[NATURE_API_MAP[label]] === 1);
}
