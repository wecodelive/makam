import React from "react";
import { useNavigate } from "react-router";

export default function SideNav({ close }) {
  const navigate = useNavigate();
  return (
    <div className=" h-[60vh] items-center justify-center flex flex-col gap-10 bg-white">
      <h1
        className="text-3xl cursor-pointer"
        onClick={() => {
          close();
          navigate("/");
        }}
      >
        Home
      </h1>
      <h2
        className="text-3xl cursor-pointer"
        onClick={() => {
          close();
          navigate("/products");
        }}
      >
        Collections
      </h2>
      <h2
        className="text-3xl cursor-pointer"
        onClick={() => {
          close();
          navigate("/new");
        }}
      >
        New
      </h2>
    </div>
  );
}
