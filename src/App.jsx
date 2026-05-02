import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import AppLayout from "@/components/layout/AppLayout";

import LoginPage from "@/pages/LoginPage";
import NotFoundPage from "@/pages/NotFoundPage";
import DashboardPage from "@/pages/DashboardPage";
import AccidentFormPage from "@/pages/AccidentFormPage";
import ChildrenPage from "@/pages/ChildrenPage";
import DailyDiaryPage from "@/pages/DailyDiaryPage";
import DailyJournalPage from "@/pages/DailyJournalPage";
import DailyReflectionsPage from "@/pages/DailyReflectionsPage";
import DailyReflectionCreatePage from "@/pages/DailyReflectionCreatePage";
import DailyReflectionDetailsPage from "@/pages/DailyReflectionDetailsPage";
import EventsPage from "@/pages/EventsPage";
import EventCreatePage from "@/pages/EventCreatePage";
import PublicHolidaysPage from "@/pages/PublicHolidaysPage";
import FormsPage from "@/pages/FormsPage";
import ReEnrollmentFormPage from "@/pages/ReEnrollmentFormPage";
import HeadCheckPage from "@/pages/HeadCheckPage";
import IngredientsPage from "@/pages/IngredientsPage";
import IpManagementPage from "@/pages/IpManagementPage";
import LessonPlanPage from "@/pages/LessonPlanPage";
import LearningProgressPage from "@/pages/LearningProgressPage";
import ChildProgressPage from "@/pages/ChildProgressPage";
import MenuPage from "@/pages/MenuPage";
import ObservationPage from "@/pages/ObservationPage";
import ObservationActivityPage from "@/pages/ObservationActivityPage";
import ObservationDetailsPage from "@/pages/ObservationDetailsPage";
import ObservationCreatePage from "@/pages/ObservationCreatePage";
import PermissionsPage from "@/pages/PermissionsPage";
import PermissionsAssignedListPage from "@/pages/PermissionsAssignedListPage";
import PermissionsAssignedDetailsPage from "@/pages/PermissionsAssignedDetailsPage";
import PermissionsRolesPage from "@/pages/PermissionsRolesPage";
import PermissionsRoleDetailsPage from "@/pages/PermissionsRoleDetailsPage";
import ProgramPlanPage from "@/pages/ProgramPlanPage";
import QipPage from "@/pages/QipPage";
import PtmPage from "@/pages/PtmPage";
import PtmDetailsPage from "@/pages/PtmDetailsPage";
import PtmCreatePage from "@/pages/PtmCreatePage";
import RecipePage from "@/pages/RecipePage";
import RoomsPage from "@/pages/RoomsPage";
import ServiceDetailsPage from "@/pages/ServiceDetailsPage";
import SettingsPage from "@/pages/SettingsPage";
import SleepCheckPage from "@/pages/SleepCheckPage";
import SnapshotsPage from "@/pages/SnapshotsPage";
import SnapshotCreatePage from "@/pages/SnapshotCreatePage";
import StaffSettingsPage from "@/pages/StaffSettingsPage";
import SuperAdminSettingsPage from "@/pages/SuperAdminSettingsPage";
import ParentSettingsPage from "@/pages/ParentSettingsPage";
import StyleGuidePage from "@/pages/StyleGuidePage";
import { useEffect } from "react";
import { authService } from "./services/authService";

export default function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<LoginPage />} />

        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/accident-form" element={<AccidentFormPage />} />
          <Route path="/children" element={<ChildrenPage />} />
          <Route path="/daily-diary" element={<DailyDiaryPage />} />
          <Route path="/daily-journal" element={<DailyJournalPage />} />
          <Route path="/daily-reflections" element={<DailyReflectionsPage />} />
          <Route path="/daily-reflections/create" element={<DailyReflectionCreatePage />} />
          <Route path="/daily-reflections/:id" element={<DailyReflectionDetailsPage />} />
          <Route path="/daily-reflections/:id/edit" element={<DailyReflectionCreatePage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/create" element={<EventCreatePage />} />
          <Route path="/events/holidays" element={<PublicHolidaysPage />} />
          <Route path="/events/:id" element={<EventCreatePage />} />
          <Route path="/events/:id/edit" element={<EventCreatePage />} />
          <Route path="/forms" element={<FormsPage />} />
          <Route path="/forms/re-enrollment" element={<ReEnrollmentFormPage />} />
          <Route path="/head-check" element={<HeadCheckPage />} />
          <Route path="/ingredients" element={<IngredientsPage />} />
          <Route path="/ip-management" element={<IpManagementPage />} />
          <Route path="/lesson-plan" element={<LessonPlanPage />} />
          <Route path="/learning-progress" element={<LearningProgressPage />} />
          <Route path="/learning-progress/:childId" element={<ChildProgressPage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/observation" element={<ObservationPage />} />
          <Route path="/observation/activity" element={<ObservationActivityPage />} />
          <Route path="/observation/create" element={<ObservationCreatePage />} />
          <Route path="/observation/:id" element={<ObservationDetailsPage />} />
          <Route path="/observation/:id/edit" element={<ObservationCreatePage />} />
          <Route path="/permissions" element={<PermissionsPage />} />
          <Route path="/permissions/assigned" element={<PermissionsAssignedListPage />} />
          <Route path="/permissions/assigned/:userId" element={<PermissionsAssignedDetailsPage />} />
          <Route path="/permissions/assigned/:userId/edit" element={<PermissionsAssignedDetailsPage />} />
          <Route path="/permissions/roles" element={<PermissionsRolesPage />} />
          <Route path="/permissions/roles/:roleId" element={<PermissionsRoleDetailsPage />} />
          <Route path="/program-plan" element={<ProgramPlanPage />} />
          <Route path="/qip" element={<QipPage />} />
          <Route path="/ptm" element={<PtmPage />} />
          <Route path="/ptm/create" element={<PtmCreatePage />} />
          <Route path="/ptm/:id" element={<PtmDetailsPage />} />
          <Route path="/recipe" element={<RecipePage />} />
          <Route path="/rooms" element={<RoomsPage />} />
          <Route path="/service-details" element={<ServiceDetailsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/sleep-check" element={<SleepCheckPage />} />
          <Route path="/snapshots" element={<SnapshotsPage />} />
          <Route path="/snapshots/create" element={<SnapshotCreatePage />} />
          <Route path="/snapshots/:id/edit" element={<SnapshotCreatePage />} />
          <Route path="/staff-settings" element={<StaffSettingsPage />} />
          <Route path="/super-admin-settings" element={<SuperAdminSettingsPage />} />
          <Route path="/parent-settings" element={<ParentSettingsPage />} />
          <Route path="/style-guide" element={<StyleGuidePage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Toaster />
    </>
  );
}