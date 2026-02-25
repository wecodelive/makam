import React from "react";
import { useNavigate } from "react-router";
import { Input } from "../Inputs";
import Button from "../Buttons";
import { Facebook, InstagramIcon, Twitch, Twitter } from "lucide-react";

export default function Footer() {
  const navigate = useNavigate();

  return (
    <div className="bg-[#F5F5F5] h-fit flex flex-col  px-6 py-15 justify-center gap-6">
      <img className="h-14 w-14 mb-3" src="/icons/logo.svg" alt="" srcSet="" />

      <div className="flex flex-col gap-4">
        <h3 className=" text-[20px] tracking-[2px]">
          Subscribe to our newsletter
        </h3>
        <p className="tracking-[1px]">
          Get all our latest updates and offers delivered straight to your
          inbox.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Input
          label="Email Address"
          placeholder="Enter your email"
          id="email"
          type="email"
          variant="h-[12px]"
        />

        <Button value="Subscribe" />
      </div>

      <div className="mt-6">
        <ul className="text-[20px] tracking-[2px] space-y-1">
          <li className="cursor-pointer" onClick={() => navigate("/")}>
            Home
          </li>
          <li className="cursor-pointer" onClick={() => navigate("/products")}>
            Collections
          </li>
          <li className="cursor-pointer" onClick={() => navigate("/new")}>
            New
          </li>
        </ul>
      </div>

      <div className="flex flex-col gap-10 tracking-[1px]">
        <p className="capitalize">
          makam is shoes are some of the best in the market and we are committed
          to providing our customers with the best shopping experience possible.
        </p>

        <p className="text-center font-semibold">
          CopyRight &copy; 2024 Makam. All rights reserved.
        </p>
      </div>

      <div className="mt-3 flex self-center gap-3 text-3xl">
        <Twitter className="h-8 w-8" />
        <InstagramIcon className="h-8 w-8" />
        <Facebook className="h-8 w-8" />
      </div>
    </div>
  );
}
