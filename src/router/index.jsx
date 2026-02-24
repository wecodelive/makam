import React, { lazy, Suspense } from "react";
import { createBrowserRouter, Outlet } from "react-router-dom";
import AppLayout from "../layout/appLayout";
import PageNotFound from "../pages/404";

// Lazy Loaded Pages
const Home = lazy(() => import("../pages/Home"));
const Products = lazy(() => import("../pages/Products"));
const Product = lazy(() => import("../pages/Products/Product"));

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <AppLayout>
        <Outlet />
      </AppLayout>
    ),
    children: [
      {
        path: "",
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
    ],
  },
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
