import React from "react";
// import { ReactComponent as NotFound } from "assets/svg/404.svg"
import { useNavigate } from "react-router-dom";

export default function PageNotFound() {
  const navigate = useNavigate();

  return (
    <div className="h-screen flex flex-col justify-center items-center">
      {/* <NotFound className="mb-6" /> */}
      <p className="font-campton_sb text-24">Something went wrong</p>
      <p className="font-campton_sb text-16 text-neutral_body text-center">
        Sorry, the page you’re looking for does not exist
      </p>
      {/* <Button
                name="Back"
                theme="blue"
                className="w-[120px] h-12 mt-[24px]"
                onClick={() => navigate(-1)}
            /> */}

      <div onClick={() => navigate(-1)} className="w-30 h-12 mt-6">
        <p>Back</p>
      </div>
    </div>
  );
}
