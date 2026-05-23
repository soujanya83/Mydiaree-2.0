import api from "../../api/api";

const ACTIVITY_DELETE_PATH = {
  breakfast: "breakfast",
  morning_tea: "morning-tea",
  lunch: "lunch",
  sleep: "sleep",
  afternoon_tea: "afternoon-tea",
  late_snacks: "late-snacks",
  sunscreen: "sunscreen",
  toileting: "toileting",
  bottle: "bottle",
};

const dailyDiaryService = {
  storeBottle: (data) => api.post("/dailyDiary/storeBottle", data),
  storeBreakfast: (data) => api.post("/activities/breakfast", data),
  storeMorningTea: (data) => api.post("/activities/morning-tea", data),
  storeLunch: (data) => api.post("/activities/lunch", data),
  storeSleep: (data) => api.post("/dailyDiary/storeSleep", data),
  storeAfternoonTea: (data) => api.post("/activities/afternoon-tea", data),
  storeLateSnacks: (data) => api.post("/activities/late-snacks", data),
  storeSunscreen: (data) => api.post("/dailyDiary/storeSunscreen", data),
  storeToileting: (data) => api.post("/dailyDiary/storeToiletingmern", data),
  listDiary: (params) => api.get("/mernDailyDiary/list", { params }),

  deleteActivity: (activityKey, id) => {
    const path = ACTIVITY_DELETE_PATH[activityKey];
    return api.delete(`/activities/${path}/delete`, { params: { id } });
  },
};

export default dailyDiaryService;
