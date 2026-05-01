// Mock permission groups + users data. Replace later with backend response.
import {
  SlidersHorizontal,
  BookOpen,
  ClipboardCheck,
  Camera,
  KeyRound,
  Activity,
  DoorOpen,
  Users,
  MessageSquare,
  ClipboardList,
  Ambulance,
} from "lucide-react";

export const PERMISSION_GROUPS = [
  {
    key: "observation",
    label: "Observation Manage",
    icon: SlidersHorizontal,
    permissions: [
      { key: "add_observation", label: "Add Observation", icon: "plus" },
      { key: "approve_observation", label: "Approve Observation", icon: "check" },
      { key: "delete_observation", label: "Delete Observation", icon: "trash" },
      { key: "update_observation", label: "Update Observation", icon: "edit" },
      { key: "view_all_observation", label: "View All Observation", icon: "eye" },
    ],
  },
  {
    key: "reflection",
    label: "Reflection Manage",
    icon: BookOpen,
    permissions: [
      { key: "add_reflection", label: "Add Reflection", icon: "plus" },
      { key: "approve_reflection", label: "Approve Reflection", icon: "check" },
      { key: "delete_reflection", label: "Delete Reflection", icon: "trash" },
      { key: "update_reflection", label: "Update Reflection", icon: "edit" },
      { key: "view_all_reflection", label: "View All Reflection", icon: "eye" },
    ],
  },
  {
    key: "qip",
    label: "QIP Manage",
    icon: ClipboardCheck,
    permissions: [
      { key: "add_qip", label: "Add QIP", icon: "plus" },
      { key: "delete_qip", label: "Delete QIP", icon: "trash" },
      { key: "download_qip", label: "Download QIP", icon: "settings" },
      { key: "edit_qip", label: "Edit QIP", icon: "edit" },
      { key: "mail_qip", label: "Mail QIP", icon: "settings" },
      { key: "print_qip", label: "Print QIP", icon: "settings" },
      { key: "view_qip", label: "View QIP", icon: "eye" },
    ],
  },
  {
    key: "room",
    label: "Room Manage",
    icon: DoorOpen,
    permissions: [
      { key: "add_room", label: "Add Room", icon: "plus" },
      { key: "delete_room", label: "Delete Room", icon: "trash" },
      { key: "edit_room", label: "Edit Room", icon: "edit" },
      { key: "view_room", label: "View Room", icon: "eye" },
    ],
  },
  {
    key: "assessment",
    label: "Assessment Manage",
    icon: ClipboardList,
    permissions: [
      { key: "add_self_assessment", label: "Add Self Assessment", icon: "plus" },
      { key: "assessment", label: "Assessment", icon: "settings" },
      { key: "delete_self_assessment", label: "Delete Self Assessment", icon: "trash" },
      { key: "edit_self_assessment", label: "Edit Self Assessment", icon: "edit" },
      { key: "view_self_assessment", label: "View Self Assessment", icon: "eye" },
    ],
  },
  {
    key: "accidents",
    label: "Accidents Manage",
    icon: Ambulance,
    permissions: [
      { key: "update_accidents", label: "Update Accidents", icon: "edit" },
    ],
  },
  {
    key: "snapshots",
    label: "Snapshots Permissions",
    icon: Camera,
    permissions: [
      { key: "add_snapshots", label: "Add Snapshots", icon: "plus" },
      { key: "delete_snapshots", label: "Delete Snapshots", icon: "trash" },
      { key: "edit_snapshots", label: "Edit Snapshots", icon: "edit" },
      { key: "view_snapshots", label: "View Snapshots", icon: "eye" },
    ],
  },
  {
    key: "activity",
    label: "Activity Permissions",
    icon: Activity,
    permissions: [
      { key: "add_activity", label: "Add Activity", icon: "plus" },
      { key: "addsub_activity", label: "Addsub Activity", icon: "plus" },
      { key: "delete_activity", label: "Delete Activity", icon: "trash" },
      { key: "deletesub_activity", label: "Deletesub Activity", icon: "trash" },
      { key: "edit_activity", label: "Edit Activity", icon: "edit" },
      { key: "editsub_activity", label: "Editsub Activity", icon: "edit" },
    ],
  },
  {
    key: "ptm",
    label: "PTM Manage",
    icon: Users,
    permissions: [],
  },
  {
    key: "messaging",
    label: "Messaging Manage",
    icon: MessageSquare,
    permissions: [],
  },
  {
    key: "other",
    label: "Other Permissions",
    icon: KeyRound,
    permissions: [
      { key: "update_head_checks", label: "Update Head Checks", icon: "edit" },
      { key: "update_modules", label: "Update Modules", icon: "edit" },
      { key: "update_permission", label: "Update Permission", icon: "edit" },
    ],
  },
];

export const ALL_PERMISSION_KEYS = PERMISSION_GROUPS.flatMap((g) =>
  g.permissions.map((p) => p.key)
);

export const ROLE_OPTIONS = [
  { value: "admin", label: "Admin" },
  { value: "staff", label: "Staff" },
  { value: "manager", label: "Manager" },
  { value: "viewer", label: "Viewer" },
];

// Mock users that can be assigned permissions
export const PERMISSION_USERS = [
  { id: "u1", name: "Adil", role: "Staff" },
  { id: "u2", name: "Aman21", role: "Staff" },
  { id: "u3", name: "Jacob Marsh", role: "Staff" },
  { id: "u4", name: "Staff", role: "Staff" },
  { id: "u5", name: "Test Staff2", role: "Staff" },
  { id: "u6", name: "Testing2", role: "Staff" },
  { id: "u7", name: "Uday", role: "Staff" },
  { id: "u8", name: "Zayn Khan", role: "Staff" },
  { id: "u9", name: "admin", role: "Admin" },
  { id: "u10", name: "rajat", role: "Staff" },
];

// Initial assigned permissions per user (key -> permission keys array)
export const initialAssignments = {
  u1: [
    "add_observation","approve_observation","delete_observation","update_observation","view_all_observation",
    "add_reflection","approve_reflection","delete_reflection","update_reflection","view_all_reflection",
    "add_qip","delete_qip","download_qip","edit_qip","mail_qip","print_qip","view_qip",
    "add_room","delete_room","edit_room","view_room",
    "add_self_assessment","assessment","delete_self_assessment","edit_self_assessment","view_self_assessment",
    "update_accidents",
    "add_snapshots","delete_snapshots","edit_snapshots","view_snapshots",
    "add_activity","addsub_activity","delete_activity","deletesub_activity","edit_activity","editsub_activity",
    "update_modules","update_permission",
  ],
  u2: ["add_observation","view_all_observation","view_qip","view_room"],
  u3: ["add_reflection","view_all_reflection","view_qip"],
  u9: ALL_PERMISSION_KEYS,
};

export const ICON_MAP = {
  plus: "Plus",
  trash: "Trash2",
  edit: "PencilLine",
  eye: "Eye",
  check: "CheckCircle2",
  settings: "Settings",
};