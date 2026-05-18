import api from "../../api/api";

export const learningProgressService = {
  /**
   * Get learning and progress index data (centers, rooms, children)
   * GET /learningandprogress/index
   */
  async getIndex(centerId, roomId, page = 1, perPage = 10, search = "") {
    const res = await api.get("/learningandprogress/index", {
      params: { 
        centerid: centerId,
        room_id: roomId,
        page,
        per_page: perPage,
        search: search || undefined
      },
    });
    return res.data;
  },

  /**
   * Get individual child progress data (Inp data)
   * GET /learningandprogress/childprogress
   * Note: The user didn't specify the URL for the second API but called it "Get Inp data".
   * Looking at common patterns, it likely takes a child_id.
   */
  async getChildProgress(childId) {
    const res = await api.get("/learningandprogress/lnpdata", {
      params: { id: childId },
    });
    return res.data;
  },

  /**
   * Update progress status
   * POST /learningandprogress/update-assessment-status
   */
  async updateProgressStatus(assessmentId, status) {
    const formData = new FormData();
    formData.append("assessment_id", assessmentId);
    formData.append("status", status);
    const res = await api.post("/learningandprogress/update-assessment-status", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  }
};
