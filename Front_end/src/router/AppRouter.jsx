import { CircularProgress } from "@mui/material";
import React, { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes, useLocation, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute"; // 静态导入关键组件
import Navbar from "../components/Navbar"; // 静态导入导航栏
const Footer = lazy(() => import("../components/Footer"));
const Home = lazy(() => import("../pages/Home"));
const FlightsList = lazy(() => import("../pages/FlightsList"));
const FlightDesignDemo = lazy(() => import("../pages/FlightDesignDemo"));
const GlassEffectDemo = lazy(() => import("../components/GlassEffectDemo"));

const Dashboard = lazy(() => import("../pages/Dashboard"));
const MonitorHome = lazy(() => import("../pages/MonitorHome"));
const AITravelAssistant = lazy(() => import("../pages/AITravelAssistant"));
const EnhancedAITravel = lazy(() => import("../pages/EnhancedAITravel"));
const ModernAITravel = lazy(() => import("../pages/ModernAITravel"));
const Profile = lazy(() => import("../pages/Profile"));
const Admin = lazy(() => import("../pages/Admin"));
const AdminMonitorSettings = lazy(() => import("../pages/AdminMonitorSettings"));
const DebugUser = lazy(() => import("../pages/DebugUser"));
const Login = lazy(() => import("../pages/Login"));
const Register = lazy(() => import("../pages/Register"));
const ForgotPassword = lazy(() => import("../pages/ForgotPassword"));
const ResetPassword = lazy(() => import("../pages/ResetPassword"));
const NotFoundComp = lazy(() => import("../pages/NotFoundComp"));
const SharedTravelPlan = lazy(() => import("../pages/SharedTravelPlan"));
const MyTravelPlans = lazy(() => import("../pages/MyTravelPlans"));
const TravelPlanDetail = lazy(() => import("../pages/TravelPlanDetail"));

// 移动端页面
const MobileSearch = lazy(() => import("../pages/MobileSearch"));

// 创建一个内部组件来使用useLocation
const AppContent = () => {
  const location = useLocation();

  // 定义需要显示Footer的页面路径
  const showFooterPaths = ['/'];

  // 检查当前路径是否需要显示Footer
  const shouldShowFooter = showFooterPaths.includes(location.pathname);

  return (
    <>
      <Navbar />
      <Routes>
        {/* 公开页面 */}
        <Route path="/" element={<Home />} />
        <Route path="/flights" element={<FlightsList />} />
        <Route path="/search" element={<MobileSearch />} />
        <Route path="/flight-design-demo" element={<FlightDesignDemo />} />
        <Route path="/glass-demo" element={<GlassEffectDemo />} />

        <Route
          path="/monitor"
          element={
            <ProtectedRoute requireAuth={true}>
              <MonitorHome />
            </ProtectedRoute>
          }
        />

        {/* 认证页面 - 已登录用户会被重定向 */}
        <Route
          path="/login"
          element={
            <ProtectedRoute requireAuth={false}>
              <Login />
            </ProtectedRoute>
          }
        />
        <Route
          path="/register"
          element={
            <ProtectedRoute requireAuth={false}>
              <Register />
            </ProtectedRoute>
          }
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* 公开分享页面 - 无需认证 */}
        <Route path="/travel-plan/:shareToken" element={<SharedTravelPlan />} />

        {/* 需要认证的页面 */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requireAuth={true}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/ai-travel"
          element={
            <ProtectedRoute requireAuth={true}>
              <ModernAITravel />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai-travel-old"
          element={
            <ProtectedRoute requireAuth={true}>
              <AITravelAssistant />
            </ProtectedRoute>
          }
        />
        <Route
          path="/enhanced-ai-travel"
          element={
            <ProtectedRoute requireAuth={true}>
              <EnhancedAITravel />
            </ProtectedRoute>
          }
        />
        <Route
          path="/modern-ai-travel"
          element={
            <ProtectedRoute requireAuth={true}>
              <ModernAITravel />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute requireAuth={true}>
              <Profile />
            </ProtectedRoute>
          }
        />
        {/* 将 /settings 重定向到 /profile */}
        <Route
          path="/settings"
          element={<Navigate to="/profile" replace />}
        />
        <Route
          path="/my-travel-plans"
          element={
            <ProtectedRoute requireAuth={true}>
              <MyTravelPlans />
            </ProtectedRoute>
          }
        />
        <Route
          path="/travel-plan-detail/:planId"
          element={
            <ProtectedRoute requireAuth={true}>
              <TravelPlanDetail />
            </ProtectedRoute>
          }
        />

        {/* 管理员页面 */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAuth={true} requireAdmin={true}>
              <Admin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/monitor-settings"
          element={
            <ProtectedRoute requireAuth={true} requireAdmin={true}>
              <AdminMonitorSettings />
            </ProtectedRoute>
          }
        />

        {/* 调试页面 */}
        <Route path="/debug-user" element={<DebugUser />} />

        {/* 临时管理员设置页面（无权限保护） */}
        <Route path="/admin-settings-test" element={<AdminMonitorSettings />} />

        {/* 404页面 */}
        <Route path="*" element={<NotFoundComp />} />
      </Routes>

      {/* 条件渲染Footer - 只在指定页面显示 */}
      {shouldShowFooter && <Footer />}
    </>
  );
};

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<CircularProgress />}>
        <AppContent />
      </Suspense>
    </BrowserRouter>
  );
};

export default AppRouter;
