import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import AppLayout from "@/components/layout/AppLayout";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import GuestRoute from "@/components/common/GuestRoute";
import LoginPage from "@/pages/LoginPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import LandingPage from "@/pages/LandingPage";
import NotFoundPage from "@/pages/NotFoundPage";
import DashboardPage from "@/pages/DashboardPage";
import MyProfilePage from "@/pages/MyProfilePage";
import AccidentFormPage from "@/pages/AccidentFormPage";
import ChildrenPage from "@/pages/ChildrenPage";
import ChildDetailsPage from "@/pages/ChildDetailsPage";
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
import RoomDetailsPage from "@/pages/RoomDetailsPage";
import RoomsPage from "@/pages/RoomsPage";
import ServiceDetailsPage from "@/pages/ServiceDetailsPage";
import SettingsPage from "@/pages/SettingsPage";
import SleepCheckPage from "@/pages/SleepCheckPage";
import SnapshotsPage from "@/pages/SnapshotsPage";
import SnapshotCreatePage from "@/pages/SnapshotCreatePage";
import StaffSettingsPage from "@/pages/StaffSettingsPage";
import SuperAdminSettingsPage from "@/pages/SuperAdminSettingsPage";
import ParentSettingsPage from "@/pages/ParentSettingsPage";
import ParentDetailsPage from "@/pages/ParentDetailsPage";
import StyleGuidePage from "@/pages/StyleGuidePage";
import ProgramPlanRecycleBinPage from "@/pages/ProgramPlanRecycleBinPage";
import ObservationRecycleBinPage from "@/pages/ObservationRecycleBinPage";
import DailyReflectionsRecycleBinPage from "@/pages/DailyReflectionsRecycleBinPage";
import SnapshotsRecycleBinPage from "@/pages/SnapshotsRecycleBinPage";
import PrivacyPolicyPage from "@/pages/PrivacyPolicyPage";
import TermsConditionsPage from "@/pages/TermsConditionsPage";

export default function App() {
  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <GuestRoute>
              <LandingPage />
            </GuestRoute>
          }
        />
        <Route
          path="/login"
          element={
            <GuestRoute>
              <LoginPage />
            </GuestRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <GuestRoute>
              <ForgotPasswordPage />
            </GuestRoute>
          }
        />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/terms-conditions" element={<TermsConditionsPage />} />

        <Route element={<AppLayout />}>
          {/* Dashboard — accessible to authenticated users */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute path="/dashboard">
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-profile"
            element={
              <ProtectedRoute path="/my-profile">
                <MyProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Daily Operations */}
          <Route
            path="/daily-diary"
            element={
              <ProtectedRoute path="/daily-diary">
                <DailyDiaryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/head-check"
            element={
              <ProtectedRoute path="/head-check">
                <HeadCheckPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sleep-check"
            element={
              <ProtectedRoute path="/sleep-check">
                <SleepCheckPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/accident-form"
            element={
              <ProtectedRoute path="/accident-form">
                <AccidentFormPage />
              </ProtectedRoute>
            }
          />

          {/* Learning & Documentation */}
          <Route
            path="/program-plan"
            element={
              <ProtectedRoute path="/program-plan">
                <ProgramPlanPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/program-plan/recycle-bin"
            element={
              <ProtectedRoute path="/program-plan">
                <ProgramPlanRecycleBinPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/learning-progress"
            element={
              <ProtectedRoute path="/learning-progress">
                <LearningProgressPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/learning-progress/:childId"
            element={
              <ProtectedRoute path="/learning-progress">
                <ChildProgressPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/daily-reflections"
            element={
              <ProtectedRoute path="/daily-reflections">
                <DailyReflectionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/daily-reflections/create"
            element={
              <ProtectedRoute path="/daily-reflections">
                <DailyReflectionCreatePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/daily-reflections/recycle-bin"
            element={
              <ProtectedRoute path="/daily-reflections">
                <DailyReflectionsRecycleBinPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/daily-reflections/:id"
            element={
              <ProtectedRoute path="/daily-reflections">
                <DailyReflectionDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/daily-reflections/:id/edit"
            element={
              <ProtectedRoute path="/daily-reflections">
                <DailyReflectionCreatePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/observation"
            element={
              <ProtectedRoute path="/observation">
                <ObservationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/observation/activity"
            element={
              <ProtectedRoute path="/observation/activity">
                <ObservationActivityPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/observation/create"
            element={
              <ProtectedRoute path="/observation">
                <ObservationCreatePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/observation/recycle-bin"
            element={
              <ProtectedRoute path="/observation">
                <ObservationRecycleBinPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/observation/:id"
            element={
              <ProtectedRoute path="/observation">
                <ObservationDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/observation/:id/edit"
            element={
              <ProtectedRoute path="/observation">
                <ObservationCreatePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/snapshots"
            element={
              <ProtectedRoute path="/snapshots">
                <SnapshotsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/snapshots/create"
            element={
              <ProtectedRoute path="/snapshots">
                <SnapshotCreatePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/snapshots/recycle-bin"
            element={
              <ProtectedRoute path="/snapshots">
                <SnapshotsRecycleBinPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/snapshots/:id/edit"
            element={
              <ProtectedRoute path="/snapshots">
                <SnapshotCreatePage />
              </ProtectedRoute>
            }
          />

          {/* Centre Management */}
          <Route
            path="/rooms"
            element={
              <ProtectedRoute path="/rooms">
                <RoomsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rooms/:roomId"
            element={
              <ProtectedRoute path="/rooms">
                <RoomDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/children"
            element={
              <ProtectedRoute path="/children">
                <ChildrenPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/children/:id"
            element={
              <ProtectedRoute path="/children">
                <ChildDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/events"
            element={
              <ProtectedRoute path="/events">
                <EventsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/events/create"
            element={
              <ProtectedRoute path="/events">
                <EventCreatePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/events/holidays"
            element={
              <ProtectedRoute path="/events">
                <PublicHolidaysPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/events/:id"
            element={
              <ProtectedRoute path="/events">
                <EventCreatePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/events/:id/edit"
            element={
              <ProtectedRoute path="/events">
                <EventCreatePage />
              </ProtectedRoute>
            }
          />
          <Route path="/service-details" element={<ServiceDetailsPage />} />

          {/* Nutrition */}
          <Route
            path="/menu"
            element={
              <ProtectedRoute path="/menu">
                <MenuPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recipe"
            element={
              <ProtectedRoute path="/recipe">
                <RecipePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ingredients"
            element={
              <ProtectedRoute path="/ingredients">
                <IngredientsPage />
              </ProtectedRoute>
            }
          />

          {/* Quality & Compliance */}
          <Route
            path="/qip"
            element={
              <ProtectedRoute path="/qip">
                <QipPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/forms"
            element={
              <ProtectedRoute path="/forms">
                <FormsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/forms/re-enrollment"
            element={
              <ProtectedRoute path="/forms">
                <ReEnrollmentFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ptm"
            element={
              <ProtectedRoute path="/ptm">
                <PtmPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ptm/create"
            element={
              <ProtectedRoute path="/ptm">
                <PtmCreatePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ptm/:id"
            element={
              <ProtectedRoute path="/ptm">
                <PtmDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lesson-plan"
            element={
              <ProtectedRoute path="/lesson-plan">
                <LessonPlanPage />
              </ProtectedRoute>
            }
          />
          <Route path="/daily-journal" element={<DailyJournalPage />} />

          {/* Administration — permission-gated or Superadmin-only */}
          <Route
            path="/ip-management"
            element={
              <ProtectedRoute path="/ip-management">
                <IpManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute path="/settings">
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff-settings"
            element={
              <ProtectedRoute path="/staff-settings">
                <StaffSettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/super-admin-settings"
            element={
              <ProtectedRoute path="/super-admin-settings">
                <SuperAdminSettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent-settings"
            element={
              <ProtectedRoute path="/parent-settings">
                <ParentSettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent-settings/:id"
            element={
              <ProtectedRoute path="/parent-settings">
                <ParentDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/permissions"
            element={
              <ProtectedRoute path="/permissions">
                <PermissionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/permissions/assigned"
            element={
              <ProtectedRoute path="/permissions">
                <PermissionsAssignedListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/permissions/assigned/:userId"
            element={
              <ProtectedRoute path="/permissions">
                <PermissionsAssignedDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/permissions/assigned/:userId/edit"
            element={
              <ProtectedRoute path="/permissions">
                <PermissionsAssignedDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/permissions/roles"
            element={
              <ProtectedRoute path="/permissions">
                <PermissionsRolesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/permissions/roles/:roleId"
            element={
              <ProtectedRoute path="/permissions">
                <PermissionsRoleDetailsPage />
              </ProtectedRoute>
            }
          />

          {/* Dev Tools */}
          <Route path="/style-guide" element={<StyleGuidePage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Toaster />
    </>
  );
}
