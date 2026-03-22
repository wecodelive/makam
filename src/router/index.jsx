import React, { lazy, Suspense } from "react";
import { createBrowserRouter, Outlet } from "react-router-dom";
import AppLayout, { CheckoutLayout } from "../layout/appLayout";
import PageNotFound from "../pages/404";
import {
  PublicAuthRoute,
  RequireAdminAuth,
  RequireUserAuth,
} from "../components/Auth/RouteGuards";

// Lazy Loaded Pages
const Home = lazy(() => import("../pages/Home"));
const Products = lazy(() => import("../pages/Products"));
const Product = lazy(() => import("../pages/Products/Product"));
const CheckOut = lazy(() => import("../pages/Checkout"));
const Orders = lazy(() => import("../pages/User/orders"));
const User = lazy(() => import("../pages/User/user"));
const WishList = lazy(() => import("../pages/User/wishList"));
const UserLogin = lazy(() => import("../pages/Auth/userLogin"));
const CreateAccount = lazy(() => import("../pages/Auth/createAccount"));
const AdminLogin = lazy(() => import("../pages/Auth/adminLogin"));

// Admin Pages
const AdminDashboard = lazy(() => import("../pages/Admin"));
const AdminProducts = lazy(() => import("../pages/Admin/products"));
const AdminOrders = lazy(() => import("../pages/Admin/orders"));
const AdminCustomers = lazy(() => import("../pages/Admin/customers"));
const AdminInventory = lazy(() => import("../pages/Admin/inventory"));
const AdminCategories = lazy(() => import("../pages/Admin/categories"));
const AdminPromotions = lazy(() => import("../pages/Admin/promotions"));
const AdminAnalytics = lazy(() => import("../pages/Admin/analytics"));
const AdminSettings = lazy(() => import("../pages/Admin/settings"));

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "products",
        element: <Products />,
      },
      {
        path: "product/:id",
        element: <Product />,
      },
      {
        path: "/checkout",
        element: <CheckOut />,
      },
      {
        path: "orders",
        element: <Orders />,
      },
      {
        path: "orders/:orderId",
        element: <Orders />,
      },
      {
        path: "user",
        element: (
          <RequireUserAuth>
            <User />
          </RequireUserAuth>
        ),
      },
      {
        path: "wishlist",
        element: (
          <RequireUserAuth>
            <WishList />
          </RequireUserAuth>
        ),
      },
      {
        path: "login",
        element: (
          <PublicAuthRoute>
            <UserLogin />
          </PublicAuthRoute>
        ),
      },
      {
        path: "create-account",
        element: (
          <PublicAuthRoute>
            <CreateAccount />
          </PublicAuthRoute>
        ),
      },
      {
        path: "admin/login",
        element: (
          <PublicAuthRoute adminOnly={true}>
            <AdminLogin />
          </PublicAuthRoute>
        ),
      },
      {
        path: "admin",
        element: (
          <RequireAdminAuth>
            <AdminDashboard />
          </RequireAdminAuth>
        ),
      },
      {
        path: "admin/products",
        element: (
          <RequireAdminAuth>
            <AdminProducts />
          </RequireAdminAuth>
        ),
      },
      {
        path: "admin/orders",
        element: (
          <RequireAdminAuth>
            <AdminOrders />
          </RequireAdminAuth>
        ),
      },
      {
        path: "admin/customers",
        element: (
          <RequireAdminAuth>
            <AdminCustomers />
          </RequireAdminAuth>
        ),
      },
      {
        path: "admin/inventory",
        element: (
          <RequireAdminAuth>
            <AdminInventory />
          </RequireAdminAuth>
        ),
      },
      {
        path: "admin/categories",
        element: (
          <RequireAdminAuth>
            <AdminCategories />
          </RequireAdminAuth>
        ),
      },
      {
        path: "admin/promotions",
        element: (
          <RequireAdminAuth>
            <AdminPromotions />
          </RequireAdminAuth>
        ),
      },
      {
        path: "admin/analytics",
        element: (
          <RequireAdminAuth>
            <AdminAnalytics />
          </RequireAdminAuth>
        ),
      },
      {
        path: "admin/settings",
        element: (
          <RequireAdminAuth>
            <AdminSettings />
          </RequireAdminAuth>
        ),
      },
    ],
  },
  // {
  //   element: <CheckoutLayout />,
  //   children: [
  //     {
  //       path: "/checkout",
  //       element: <CheckOut />,
  //     },
  //   ],
  // },
  // {
  //     path: 'onboarding',
  //     element: (
  //         <Suspense fallback={<Spinner />}>
  //             <RequireAuth>
  //                 <Onboarding />
  //             </RequireAuth>
  //         </Suspense>
  //     ),
  // },
  // {
  //     path: '/',
  //     errorElement: <div>Something went wrong</div>,
  //     element: (
  //         <AppLayout>
  //             <Outlet />
  //         </AppLayout>
  //     ),
  //     children: [
  //         {
  //             path: 'dashboard',
  //             element: <div>dashboard</div>,
  //         },
  //         // {
  //         //     path: 'appointments',
  //         //     element: <Appointments />,
  //         // },
  //         // {
  //         //     path: 'appointments/new-appointment',
  //         //     element: <NewAppointment />,
  //         // },
  //     ],
  // },

  {
    path: "*",
    element: <PageNotFound />,
  },
]);

export { router };
