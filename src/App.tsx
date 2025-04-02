import './App.css';
import { useState, useContext } from "react";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import 'primereact/resources/primereact.css';
import 'primereact/resources/themes/lara-light-indigo/theme.css';

import { HiMiniChartPie } from "react-icons/hi2";
import { MdOutlinePets, MdSick, MdAssignment } from "react-icons/md";
import { BiSolidBarChartSquare } from "react-icons/bi";

import Sidebar, { SidebarItem } from "./components/side-bar/Sidebar";
import Header from "./components/header/Header";
import Breadcrumb_Comp from "./components/breadcrumb/Breadcrumb_Comp";
import LoginPage from "./pages/login/LoginPage";
import Dashboard from './pages/dashboard/DashboardPage';
import Herds from './pages/herds/Herds';
import AbnormalDetection from './pages/herds/AbnormalDetection';
import HerdsReport from './pages/herds/HerdsReport';
import EpidemicReport from './pages/epidemic/EpidemicReport';
import TreatmentPlan from './pages/epidemic/TreatmentPlan';
import TrackRecord from './pages/epidemic/TrackRecord';
import ResourcesReport from './pages/resources/ResourcesReport';
import Water from './pages/resources/Water';
import Food from './pages/resources/Food';
import Medical from './pages/resources/Medical';
import JobManage from './pages/job/JobManage';
import JobReport from './pages/job/JobReport';
import { AuthContext } from './hooks/user';
import Categories from './pages/prev-pages/categories/Categories';
import OldHerds from './pages/prev-pages/herds/Herds';
import Records from './pages/prev-pages/herds/Records';
import Diseases from './pages/prev-pages/diseases/Diseases';
import Treatments from './pages/prev-pages/treatments/Treatments';
import { NotificationProvider } from "./contexts/NotificationContext";
import NotificationContainer from "./components/NotificationContainer";
import { FaBookOpenReader, FaCalendarDays } from 'react-icons/fa6';
import StudentManager from './pages/studentManager/Student-Manger';
import StudentsBasicTable from './components/classStudentTable/classStudent';
import WeeklyScheduler from './pages/Scheduler/Scheduler';
const queryClient = new QueryClient();
const SIDEBAR_ITEMS = [
  { text: "Tổng quan", url: "/dashboard", icon: <HiMiniChartPie /> },
  {
    text: "QL sinh viên",
    url: "/manager",
    icon: <FaBookOpenReader />,
    subItems: [
      { text: "QL lớp học", url: "/manager/classes" },
      { text: "QL sinh viên", url: "/manager/students" },
    ],
  },
  {
    text: "Thời khoá biểu",
    url: "/schedule",
    icon: <FaCalendarDays />,
  },
  {
    text: "QL Tài nguyên",
    url: "/resources",
    icon: <BiSolidBarChartSquare />,
    subItems: [
      { text: "Nước", url: "/resources/water" },
      { text: "Thức ăn", url: "/resources/food" },
      { text: "Y tế", url: "/resources/medical" },
      { text: "Báo cáo", url: "/resources/report" },
    ],
  },
  {
    text: "QL Công việc",
    url: "/job",
    icon: <MdAssignment />,
    subItems: [
      { text: "Công việc", url: "/job/manage" },
      { text: "Báo cáo", url: "/job/report" },
    ],
  },
  //Code prev
  {
    text: "QL Admin (Prev)",
    url: "/admin",
    icon: <MdAssignment />,
    subItems: [
      { text: "Nhóm vật nuôi", url: "/admin/categories" },
      { text: "Đàn (pages old)", url: "/admin/old-herds" },
      { text: "Bệnh", url: "/admin/diseases" },
      { text: "Điều trị", url: "/admin/treatments" },
    ],
  },

];

function App() {
  const [breadcrumbItems, setBreadcrumbItems] = useState<{ name: string; url: string }[]>([]);
  const handleSidebarSelect = (selectedPath: string) => {
    const foundItem = SIDEBAR_ITEMS.find(
      (item) => item.url === selectedPath || item.subItems?.some((sub) => sub.url === selectedPath)
    );
    if (foundItem) {
      const selectedSub = foundItem.subItems?.find((sub) => sub.url === selectedPath);
      setBreadcrumbItems([
        { name: foundItem.text, url: foundItem.url },
        ...(selectedSub ? [{ name: selectedSub.text, url: selectedSub.url }] : []),
      ]);
    }
  };
  const Layout = () => {
    const { currentUser } = useContext(AuthContext);
    return (
      <>
        {currentUser && (
          <div className="flex">
            <div className="flex-1 max-w-[345px] box-border">
              <Sidebar>
                {SIDEBAR_ITEMS.map((item) => (
                  <SidebarItem
                    key={item.url}
                    icon={item.icon}
                    text={item.text}
                    url={item.url}
                    onSelect={handleSidebarSelect}
                    subItems={item.subItems}
                  />
                ))}
              </Sidebar>
            </div>

            <main className="flex-5 py-4 px-6">
              <Header />
              <Breadcrumb_Comp items={breadcrumbItems} onNavigate={(url) => console.log("Navigate to:", url)} />
              <>
                <QueryClientProvider client={queryClient}>
                  <Outlet />
                </QueryClientProvider>
              </>
            </main>

          </div>
        )}
      </>
    );
  };

  const router = createBrowserRouter([
    {
      path: "/",
      element: <LoginPage />,
    },
    {
      path: "/",
      element: <Layout />,
      children: [
        {
          path: "/dashboard",
          element: <Dashboard />,
        },
        {
          path: "/manager/classes",
          element: <StudentsBasicTable />,
        },
        {
          path: "/manager/students",
          element: <StudentManager />,
        },
        {
          path: "/schedule",
          element: <WeeklyScheduler />,
        },
        {
          path: "/epidemic/track-record",
          element: <TrackRecord />,
        },
        {
          path: "/epidemic/treatment-plan",
          element: <TreatmentPlan />,

        },
        {
          path: "/epidemic/report",
          element: <EpidemicReport />,
        },
        {
          path: "/resources/water",
          element: <Water />,
        },
        {
          path: "/resources/food",
          element: <Food />,
        },
        {
          path: "/resources/medical",
          element: <Medical />,
        },
        {
          path: "/resources/report",
          element: <ResourcesReport />,
        },
        {
          path: "/job/manage",
          element: <JobManage />,
        },
        {
          path: "/job/report",
          element: <JobReport />,
        },
        {
          path: "/admin/categories",
          element: <Categories />,
        },
        {
          path: "/admin/diseases",
          element: <Diseases />,
        },
        {
          path: "/admin/treatments",
          element: <Treatments />,
        },
        {
          path: "/admin/old-herds",
          element: <OldHerds />,
        },
        {
          path: "/herds/:id",
          element: <Records />,
        },
        {
          path: "/detection",
          element: <Records />,
        },
      ],
    },
  ]);
  return (
    <NotificationProvider>
      <NotificationContainer />
      <RouterProvider router={router} />
    </NotificationProvider>
  );
}

export default App;