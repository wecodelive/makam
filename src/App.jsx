import "./App.css";
import { router } from "./router";
import { RouterProvider } from "react-router-dom";
import Notifications from "./components/Notifications";
import ConfirmModal from "./components/ConfirmModal";
// import Notification from "components/Notifications";
// import Loader from "components/Modals/Loader";

// import { MIC01CProvider } from "context/MIC01CContext";

function App() {
  return (
    <div className="relative h-screen">
      {/* <Loader /> */}
      <Notifications />
      <ConfirmModal />
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
