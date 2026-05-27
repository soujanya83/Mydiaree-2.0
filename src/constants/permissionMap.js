/**
 * Permission Mapping Configuration
 *
 * ROUTE_PERMISSIONS: Maps sidebar routes → permission keys.
 *   If a user has ANY of the listed permissions, the route is visible.
 *   Routes not listed here are either:
 *     - Always visible (Dashboard, Service Details)
 *     - Superadmin-only (IP Management, Super Admin Settings)
 *
 * SUPERADMIN_ONLY_ROUTES: Routes only visible to Superadmin users.
 *   These modules are NOT in the permissions API.
 *
 * ACTION_PERMISSIONS: Maps module actions (add, edit, delete, etc.)
 *   to specific permission key names for page-level button guards.
 */

// ---------------------------------------------------------------------------
// Route → Permission keys (sidebar visibility)
// If user has at least ONE of these, the nav item is shown.
// Empty array = always visible (no permission check).
// ---------------------------------------------------------------------------
export const ROUTE_PERMISSIONS = {
  // Daily Operations
  "/daily-diary": ["viewDailyDiary", "updateDailyDiary"],
  "/head-check": ["updateHeadChecks"],
  "/sleep-check": ["updateHeadChecks"],
  "/accident-form": ["updateAccidents"],

  // Learning & Documentation
  "/program-plan": ["addProgramPlan", "editProgramPlan", "viewProgramPlan", "deleteProgramPlan"],
  "/learning-progress": ["addProgress", "editProgress", "viewProgress"],
  "/daily-reflections": [
    "addReflection",
    "approveReflection",
    "updateReflection",
    "deleteReflection",
    "viewAllReflection",
  ],
  "/observation": [
    "addObservation",
    "approveObservation",
    "deleteObservation",
    "updateObservation",
    "viewAllObservation",
  ],
  "/observation/activity": [
    "addActivity",
    "editActivity",
    "deleteActivity",
    "addsubActivity",
    "editsubActivity",
    "deletesubActivity",
  ],
  "/snapshots": ["addSnapshots", "viewSnapshots", "editSnapshots", "deleteSnapshots"],

  // Centre Management
  "/rooms": ["viewRoom", "addRoom", "editRoom", "deleteRoom"],
  "/children": ["addChildGroup", "viewChildGroup", "updateChildGroup"],
  "/events": [
    "addAnnouncement",
    "approveAnnouncement",
    "deleteAnnouncement",
    "updateAnnouncement",
    "viewAllAnnouncement",
  ],
  "/service-details": [], // No permission in API — always visible

  // Nutrition
  "/menu": ["addMenu", "approveMenu", "deleteMenu", "updateMenu"],
  "/recipe": ["addRecipe", "approveRecipe", "deleteRecipe", "updateRecipe"],
  "/ingredients": ["addMenu", "approveMenu", "deleteMenu", "updateMenu"],

  // Quality & Compliance
  "/qip": ["addQip", "editQip", "deleteQip", "downloadQip", "printQip", "mailQip", "viewQip"],
  "/forms": ["updateAccidents"],
  "/ptm": ["viewPtm", "createPtm", "reschedulePtm", "deletePtm", "editPtm"],
  "/lesson-plan": ["editLesson", "viewLesson", "printPdfLesson"],

  // Administration (permission-gated)
  "/staff-settings": ["addUsers", "viewUsers", "updateUsers"],
  "/settings": ["addCenters", "viewCenters", "updateCenters"],
  "/parent-settings": ["addParent", "viewParent", "updateParent"],
  "/permissions": ["updatePermission"],
};

// ---------------------------------------------------------------------------
// Superadmin-only routes — hidden from non-Superadmin users entirely.
// These modules are NOT present in the permissions API.
// ---------------------------------------------------------------------------
export const SUPERADMIN_ONLY_ROUTES = ["/ip-management", "/super-admin-settings"];

// ---------------------------------------------------------------------------
// Action → Permission key (page-level button guards)
// ---------------------------------------------------------------------------
export const ACTION_PERMISSIONS = {
  snapshots: {
    add: "addSnapshots",
    view: "viewSnapshots",
    edit: "editSnapshots",
    delete: "deleteSnapshots",
  },
  observation: {
    add: "addObservation",
    approve: "approveObservation",
    delete: "deleteObservation",
    edit: "updateObservation",
    view: "viewAllObservation",
  },
  reflection: {
    add: "addReflection",
    approve: "approveReflection",
    edit: "updateReflection",
    delete: "deleteReflection",
    view: "viewAllReflection",
  },
  programPlan: {
    add: "addProgramPlan",
    edit: "editProgramPlan",
    view: "viewProgramPlan",
    delete: "deleteProgramPlan",
  },
  dailyDiary: {
    view: "viewDailyDiary",
    update: "updateDailyDiary",
  },
  headCheck: {
    update: "updateHeadChecks",
  },
  accidentForm: {
    update: "updateAccidents",
  },
  rooms: {
    view: "viewRoom",
    add: "addRoom",
    edit: "editRoom",
    delete: "deleteRoom",
  },
  children: {
    add: "addChildGroup",
    view: "viewChildGroup",
    edit: "updateChildGroup",
  },
  events: {
    add: "addAnnouncement",
    approve: "approveAnnouncement",
    delete: "deleteAnnouncement",
    edit: "updateAnnouncement",
    view: "viewAllAnnouncement",
  },
  menu: {
    add: "addMenu",
    approve: "approveMenu",
    delete: "deleteMenu",
    edit: "updateMenu",
  },
  recipe: {
    add: "addRecipe",
    approve: "approveRecipe",
    delete: "deleteRecipe",
    edit: "updateRecipe",
  },
  qip: {
    add: "addQip",
    edit: "editQip",
    delete: "deleteQip",
    download: "downloadQip",
    print: "printQip",
    mail: "mailQip",
    view: "viewQip",
  },
  ptm: {
    view: "viewPtm",
    add: "createPtm",
    reschedule: "reschedulePtm",
    delete: "deletePtm",
    edit: "editPtm",
  },
  survey: {
    add: "addSurvey",
    approve: "approveSurvey",
    delete: "deleteSurvey",
    edit: "updateSurvey",
    view: "viewAllSurvey",
  },
  lessonPlan: {
    edit: "editLesson",
    view: "viewLesson",
    print: "printPdfLesson",
  },
  assessment: {
    add: "addSelfAssessment",
    edit: "editSelfAssessment",
    delete: "deleteSelfAssessment",
    view: "viewSelfAssessment",
  },
  activity: {
    add: "addActivity",
    delete: "deleteActivity",
    edit: "editActivity",
    addSub: "addsubActivity",
    deleteSub: "deletesubActivity",
    editSub: "editsubActivity",
  },
  learningProgress: {
    add: "addProgress",
    edit: "editProgress",
    view: "viewProgress",
  },
  staffSettings: {
    add: "addUsers",
    view: "viewUsers",
    edit: "updateUsers",
  },
  centerSettings: {
    add: "addCenters",
    view: "viewCenters",
    edit: "updateCenters",
  },
  parentSettings: {
    add: "addParent",
    view: "viewParent",
    edit: "updateParent",
  },
  managePermissions: {
    edit: "updatePermission",
  },
  modules: {
    update: "updateModules",
  },
};
