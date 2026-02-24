import React from "react";
import { Handbag } from "lucide-react";
import { UserRound } from "lucide-react";
import Modal from "../Modals/Modal";
import SideNav from "./SideNav";
import { useNavigate } from "react-router";

export default function Header() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = React.useState(false);

  const toggleModal = () => {
    setShowModal((prev) => !prev);
  };

  return (
    <>
      <div>
        <header className="flex justify-between py-7 px-6">
          <img
            className="h-4 w-6.5"
            src="/icons/hamburger.svg"
            alt=""
            srcSet=""
            onClick={toggleModal}
          />

          <div className="flex justify-between w-[60%]">
            <img
              onClick={() => navigate("/")}
              className="h-7.25 w-7.25"
              src="/icons/logo.svg"
              alt=""
              srcSet=""
            />

            <div className="flex justify-between w-[45%]">
              <div className="flex justify-center items-center outline-4 aspect-square rounded-full w-10 h-10">
                <Handbag className="h-5 w-5" />
              </div>

              <div className="flex justify-center items-center outline-4 aspect-square rounded-full w-10 h-10">
                <UserRound className="h-5 w-5" />
              </div>
            </div>
          </div>
        </header>
      </div>

      {showModal && (
        <Modal
          styles="w-full md:w-[50%] lg:w-[40%]"
          position="modal-right"
          closeModal={toggleModal}
        >
          <SideNav close={toggleModal} />
        </Modal>
      )}
    </>
  );
}
