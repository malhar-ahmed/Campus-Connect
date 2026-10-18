import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function MainLayout() {
  const location = useLocation();

  return (
    <>
      <Navbar />

      <div className="page-transition" key={location.pathname}>
        <Outlet />
      </div>

      <Footer />
    </>
  );
}

export default MainLayout;