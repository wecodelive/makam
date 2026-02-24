import React, { Suspense } from "react";
import { Outlet } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";

export default function AppLayout() {
  return (
    <div className="">
      {/* <div className="flex relative py-0 sm:py-[24px] px-0 sm:px-[32px] h-screen bg-gray-900"> */}
      <div className="w-full overflow-y-auto overflow-x-hidden">
        <Suspense
          fallback={
            <div className="h-full w-full flex items-center justify-center">
              Loading....
            </div>
          }
        >
          <Header />
          <Outlet />
          <Footer />
        </Suspense>
      </div>
    </div>
  );
}
