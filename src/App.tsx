import './App.css';
import { useState, useContext } from "react";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import 'primereact/resources/primereact.css';
import 'primereact/resources/themes/lara-light-indigo/theme.css';

import { HiMiniChartPie } from "react-icons/hi2";
import { BiSolidCctv } from "react-icons/bi";

import Sidebar, { SidebarItem } from "./components/side-bar/Sidebar";
import Header from "./components/header/Header";
import Breadcrumb_Comp from "./components/breadcrumb/Breadcrumb_Comp";
import LoginPage from "./pages/loginPage/LoginPage";
import Dashboard from './pages/dashboardPage/DashboardPage';
import { PiChartLineFill } from "react-icons/pi";
import { AuthContext } from './hooks/user';
import { NotificationProvider } from "./contexts/NotificationContext";
import NotificationContainer from "./components/NotificationContainer";
import { FaBookOpenReader, FaCalendarDays } from 'react-icons/fa6';
import StudentManager from './pages/studentManagerPage/Student-Manger';
import StudentsBasicTable from './components/classStudentTable/classStudent';
import WeeklyScheduler from './pages/SchedulerPage/Scheduler';
import AttendanceStream from './pages/attendancePage/attendanceStream';
import HumanCouterPanel from './pages/humanCouterPage/HumanCouterPage';
import ReportPage from './pages/reportPage/ReportPage';
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
    text: "Giám sát",
    url: "/camera",
    icon: <BiSolidCctv />,
    subItems: [
      { text: "Điểm danh", url: "/camera/attendance" },
      { text: "Giám sát", url: "/camera/recognition" },
    ],
  },
  {
    text: "Báo cáo/thống kê",
    url: "/report",
    icon: <PiChartLineFill />,
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
          path: "/camera/attendance",
          element: <AttendanceStream />,
        },
        {
          path: "/camera/recognition",
          element: <HumanCouterPanel />,

        },
        {
          path: "/report",
          element: <ReportPage />,
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