import api from "../../api/api";

const dailyDiaryService = {
  storeBottle: (data) => api.post("/dailyDiary/storeBottle", data),
  storeBreakfast: (data) => api.post("/activities/breakfast", data),
  storeMorningTea: (data) => api.post("/activities/morning-tea", data),
  storeLunch: (data) => api.post("/activities/lunch", data),
  storeSleep: (data) => api.post("/dailyDiary/storeSleep", data),
  storeAfternoonTea: (data) => api.post("/activities/afternoon-tea", data),
  storeLateSnacks: (data) => api.post("/activities/late-snacks", data),
  storeSunscreen: (data) => api.post("/dailyDiary/storeSunscreen", data),
  storeToileting: (data) => api.post("/dailyDiary/storeTolitring", data),
  listDiary: (data) => api.post("/DailyDiary/list", data),
};

export default dailyDiaryService;
