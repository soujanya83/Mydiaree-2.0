import api from "../../api/api";

const appendIfPresent = (formData, key, value) => {
  formData.append(key, value ?? "");
};

const appendArray = (formData, key, values = []) => {
  values.forEach((value) => {
    if (value !== undefined && value !== null && value !== "") {
      formData.append(key, value);
    }
  });
};

const serializeActivityGroups = (groups = []) =>
  groups
    .map((group) => {
      const items = (group.items || []).map((item) => `• ${item}`).join("\r\n");
      return [group.activity ? `${group.activity} -` : "", items].filter(Boolean).join("\r\n");
    })
    .filter(Boolean)
    .join("\r\n");

const monthToNumber = (month) => {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const index = months.findIndex((item) => item.toLowerCase() === String(month).toLowerCase());
  return index >= 0 ? String(index + 1) : String(month || "");
};

export const programPlanService = {
  async getProgramPlans(centerId) {
    const res = await api.get("/programPlanList", {
      params: { centerid: centerId },
    });
    return res.data;
  },

  async getRoomsAndStaff(centerId) {
    const formData = new FormData();
    formData.append("user_center_id", centerId);
    const res = await api.post("/rooms", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },

  async saveProgramPlan(plan) {
    const formData = new FormData();

    if (plan.planId) {
      appendIfPresent(formData, "plan_id", plan.planId);
    }
    appendIfPresent(formData, "centerid", plan.centreId);
    appendIfPresent(formData, "room_id", plan.roomId);
    appendIfPresent(formData, "months", monthToNumber(plan.month));
    appendIfPresent(formData, "years", String(plan.year || ""));
    appendIfPresent(
      formData,
      "status",
      String(plan.status || "draft").toLowerCase() === "published" ? "Published" : "Draft",
    );

    appendArray(formData, "users[]", plan.educators);
    appendArray(formData, "children[]", plan.children);

    appendIfPresent(formData, "practical_life", serializeActivityGroups(plan.practicalLife));
    appendIfPresent(formData, "focus_area", plan.focusArea);
    appendIfPresent(formData, "eylf", (plan.eylf || []).join("\r\n"));
    appendIfPresent(formData, "sensorial", serializeActivityGroups(plan.sensorial));
    appendIfPresent(formData, "math", serializeActivityGroups(plan.math));
    appendIfPresent(formData, "language", serializeActivityGroups(plan.language));
    appendIfPresent(formData, "culture", serializeActivityGroups(plan.culture));
    appendIfPresent(formData, "art_craft", plan.artCraft);
    appendIfPresent(formData, "outdoor_experiences", plan.outdoor);
    appendIfPresent(formData, "inquiry_topic", plan.inquiry);
    appendIfPresent(formData, "sustainability_topic", plan.sustainability);
    appendIfPresent(formData, "special_events", plan.specialEvents);
    appendIfPresent(formData, "children_voices", plan.childrenVoices);
    appendIfPresent(formData, "families_input", plan.familiesInput);
    appendIfPresent(formData, "group_experience", plan.groupExperience);
    appendIfPresent(formData, "spontaneous_experience", plan.spontaneous);
    appendIfPresent(formData, "mindfulness_experiences", plan.mindfulness);
    appendIfPresent(formData, "working", plan.whatIsWorking);
    appendIfPresent(formData, "notworking", plan.whatIsNotWorking);

    const res = await api.post("/LessonPlanList/save_program_planinDB", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },

  async deleteProgramPlan(programId) {
    const formData = new FormData();
    formData.append("program_id", programId);
    const res = await api.post("/LessonPlanList/deletedataofprogramplan", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },
};
