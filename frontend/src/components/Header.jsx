import { NavLink, Link, useNavigate } from "react-router";
import { useAuth } from "../store/authStore";
import { useState } from "react";
import { toast } from "react-hot-toast";

import {
  Home,
  Stethoscope,
  LayoutDashboard,
  User,
  LogOut,
  LogIn,
  UserPlus,
  Activity,
  Phone,
  MapPin,
  Clock,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";

function Header() {

  // auth
  const { currentUser, isAuthenticated, logout } = useAuth();

  const navigate = useNavigate();

  // dropdown states
  const [open, setOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);

  // hospital locations
  const hospitalLocations = [
    "Hyderabad, Telangana",
    "Warangal, Telangana",
    "Karimnagar, Telangana",
    "Nizamabad, Telangana",
    "Khammam, Telangana",
    "Vijayawada, Andhra Pradesh",
    "Visakhapatnam, Andhra Pradesh",
    "Guntur, Andhra Pradesh",
    "Tirupati, Andhra Pradesh",
    "Kakinada, Andhra Pradesh",
  ];

  // logout
  const handleLogout = async () => {

    await logout();

    localStorage.removeItem("token");

    toast.success("Logout successful");

    navigate("/");
  };

  // nav styles
  const navLinkStyle = ({ isActive }) =>
    `relative flex items-center gap-1.5 py-2 px-3 text-sm font-semibold transition-all duration-300 rounded-xl ${
      isActive
        ? "text-blue-600 bg-blue-50/60"
        : "text-gray-600 hover:text-blue-600 hover:bg-gray-50/50"
    }`;

  return (
    <header className="sticky top-0 z-50 w-full flex flex-col shadow-sm">

      {/* TOP EMERGENCY BAR */}
      <div className="bg-red-600 text-white text-xs md:text-sm font-semibold py-2 px-6 md:px-10 w-full">

        <div className="max-w-7xl mx-auto flex items-center justify-between w-full">

          {/* emergency */}
          <a
            href="tel:+18001234567"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
          >
            <Phone size={14} className="animate-pulse" />

            <span>
              Emergency: +1 (800) 123-4567
            </span>
          </a>

          {/* visiting hours */}
          <div className="hidden md:flex items-center gap-6 text-xs font-medium">

            <span className="flex items-center gap-1.5 opacity-90">
              <Clock size={12} />
              Visiting Hours: 9AM - 8PM
            </span>

          </div>

        </div>
      </div>

      {/* MAIN NAVBAR */}
      <nav className="w-full bg-white/80 backdrop-blur-xl border-b border-blue-50/40">

        <div className="max-w-7xl mx-auto px-6 md:px-10 h-20 flex items-center justify-between">

          {/* LEFT BRANDING */}
          <div
            className="cursor-pointer flex items-center gap-3 group"
            onClick={() => navigate("/")}
          >

            {/* logo */}
            <div className="w-11 h-11 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100 group-hover:scale-105 transition-all duration-300 shadow-sm shadow-blue-200/20">

              <Activity className="w-6 h-6 text-blue-600 animate-pulse" />

            </div>

            {/* text */}
            <div>

              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent leading-none">
                PeopleCare
              </h1>

              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                International Hospital
              </p>

            </div>

          </div>

          {/* RIGHT NAVIGATION */}
          <div className="flex items-center gap-3 md:gap-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <div className="hidden md:flex items-center gap-3 md:gap-4">

              {/* HOME */}
              <NavLink
                to="/"
                className={navLinkStyle}
              >
                <Home size={16} />
                <span className="hidden sm:inline">
                  Home
                </span>
              </NavLink>

              {/* DOCTORS */}
              <NavLink
                to="/doctors"
                className={navLinkStyle}
              >
                <Stethoscope size={16} />
                <span>Doctors</span>
              </NavLink>

              {/* LOCATIONS DROPDOWN */}
              <div className="relative">

                <button
                  onClick={() =>
                    setLocationOpen(!locationOpen)
                  }
                  className="
                    flex
                    items-center
                    gap-1.5
                    py-2
                    px-3
                    text-sm
                    font-semibold
                    text-gray-600
                    hover:text-blue-600
                    hover:bg-gray-50/50
                    rounded-xl
                    transition-all
                    duration-300
                  "
                >
                  <MapPin size={16} />

                  <span>Locations</span>

                  <ChevronDown
                    size={15}
                    className={`transition-transform duration-300 ${
                      locationOpen
                        ? "rotate-180"
                        : ""
                    }`}
                  />

                </button>

                {/* DROPDOWN */}
                {locationOpen && (

                  <div
                    className="
                      absolute
                      top-12
                      left-0
                      w-72
                      bg-white
                      border
                      border-gray-100
                      rounded-2xl
                      shadow-xl
                      overflow-hidden
                      z-50
                    "
                  >

                  {/* title */}
                  <div className="px-4 py-3 border-b border-gray-100 bg-blue-50">

                    <h3 className="text-sm font-bold text-blue-700">
                      Our Hospital Branches
                    </h3>

                  </div>

                  {/* location list */}
                  <div className="max-h-72 overflow-y-auto p-2">

                    {hospitalLocations.map(
                      (location, index) => (

                        <div
                          key={index}

                          onClick={() => {

                            navigate("/locations");

                            setLocationOpen(false);
                          }}

                          className="
                            flex
                            items-center
                            gap-2
                            px-3
                            py-2.5
                            rounded-xl
                            hover:bg-blue-50
                            transition-colors
                            text-sm
                            text-gray-700
                            cursor-pointer
                          "
                        >

                          <MapPin
                            size={14}
                            className="text-blue-600"
                          />

                          <span>
                            {location}
                          </span>

                        </div>
                      )
                    )}

                  </div>

                </div>
              )}

            </div>

            {/* DASHBOARD */}
            {isAuthenticated && (

              <NavLink
                to={
                  currentUser?.role === "PATIENT"
                    ? "/patient-dashboard"
                    : currentUser?.role === "DOCTOR"
                    ? "/doctor-dashboard"
                    : "/admin-dashboard"
                }
                className={navLinkStyle}
              >

                <LayoutDashboard size={16} />

                <span className="hidden sm:inline">
                  Dashboard
                </span>

              </NavLink>
            )}

            {/* divider */}
            <div className="h-6 w-px bg-gray-100 mx-1"></div>

            {/* AUTH */}
            {!isAuthenticated ? (

              <div className="flex items-center gap-2">

                {/* LOGIN */}
                <Link
                  className="
                    text-gray-600
                    hover:text-blue-600
                    font-semibold
                    text-sm
                    px-4
                    py-2.5
                    rounded-xl
                    hover:bg-gray-50/80
                    transition
                    flex
                    items-center
                    gap-1.5
                  "
                  to="/login"
                >

                  <LogIn size={15} />

                  <span>Login</span>

                </Link>

                {/* REGISTER */}
                <Link
                  className="
                    bg-linear-to-r
                    from-blue-600
                    to-indigo-600
                    hover:from-blue-700
                    hover:to-indigo-700
                    text-white
                    px-5
                    py-2.5
                    rounded-xl
                    font-bold
                    text-sm
                    shadow-md
                    shadow-blue-500/10
                    hover:shadow-lg
                    active:scale-[0.98]
                    transition-all
                    duration-200
                    flex
                    items-center
                    gap-1.5
                  "
                  to="/register"
                >

                  <UserPlus size={15} />

                  <span>Register</span>

                </Link>

              </div>

            ) : (

              <div className="relative">

                {/* PROFILE */}
                <div
                  onClick={() => setOpen(!open)}
                  className="
                    flex
                    items-center
                    gap-2
                    p-1.5
                    pr-3
                    hover:bg-gray-50
                    rounded-2xl
                    border
                    border-transparent
                    hover:border-gray-100
                    transition-all
                    duration-200
                    cursor-pointer
                  "
                >

                  <img
                    src={
                      currentUser?.profileImage
                        ? currentUser.profileImage.startsWith("http")
                          ? currentUser.profileImage
                          : `${currentUser.profileImage}`
                        : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                    }

                    alt="profile"

                    className="
                      w-9
                      h-9
                      rounded-xl
                      object-cover
                      border
                      border-blue-100
                      shadow-sm
                    "
                  />

                </div>

                {/* PROFILE DROPDOWN */}
                {open && (

                  <div
                    className="
                      absolute
                      right-0
                      mt-3
                      w-56
                      bg-white
                      border
                      border-gray-100
                      rounded-2xl
                      shadow-xl
                      shadow-gray-200/50
                      overflow-hidden
                      z-50
                    "
                  >

                    {/* user details */}
                    <div className="px-4 py-4 border-b border-gray-50 bg-[#fbfcfe]">

                      <p className="font-bold text-gray-800 text-sm truncate">
                        {currentUser?.name || "User"}
                      </p>

                      <span className="inline-block mt-1 text-[10px] font-bold text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded-md">
                        {currentUser?.role}
                      </span>

                    </div>

                    {/* buttons */}
                    <div className="p-1">

                      {/* profile */}
                      <button
                        onClick={() => {

                          if (
                            currentUser?.role === "PATIENT"
                          ) {
                            navigate("/patient-profile");

                          } else if (
                            currentUser?.role === "DOCTOR"
                          ) {
                            navigate("/doctor-form");

                          } else {
                            navigate("/admin-dashboard");
                          }

                          setOpen(false);
                        }}

                        className="
                          w-full
                          text-left
                          px-3
                          py-2.5
                          hover:bg-blue-50/50
                          hover:text-blue-600
                          transition-colors
                          rounded-xl
                          text-gray-700
                          text-xs
                          font-semibold
                          flex
                          items-center
                          gap-2
                        "
                      >

                        <User size={14} />

                        <span>
                          My Profile
                        </span>

                      </button>

                      {/* logout */}
                      <button
                        onClick={handleLogout}

                        className="
                          w-full
                          text-left
                          px-3
                          py-2.5
                          hover:bg-red-50
                          hover:text-red-500
                          transition-colors
                          rounded-xl
                          text-red-500
                          text-xs
                          font-semibold
                          flex
                          items-center
                          gap-2
                          mt-0.5
                        "
                      >

                        <LogOut size={14} />

                        <span>
                          Logout
                        </span>

                      </button>

                    </div>

                  </div>
                )}

              </div>
            )}

          </div>

        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 shadow-xl">
            <div className="px-4 py-4 space-y-2">
              <NavLink
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold transition-all duration-200 ${
                    isActive ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50"
                  }`
                }
              >
                <Home size={16} /> Home
              </NavLink>

              <NavLink
                to="/doctors"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold transition-all duration-200 ${
                    isActive ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50"
                  }`
                }
              >
                <Stethoscope size={16} /> Doctors
              </NavLink>

              <button
                type="button"
                onClick={() => setLocationOpen(!locationOpen)}
                className="flex w-full items-center justify-between gap-2 rounded-xl px-3 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all duration-200"
              >
                <span className="flex items-center gap-2">
                  <MapPin size={16} /> Locations
                </span>
                <ChevronDown
                  size={15}
                  className={`transition-transform duration-300 ${locationOpen ? "rotate-180" : ""}`}
                />
              </button>

              {locationOpen && (
                <div className="rounded-2xl bg-slate-50 border border-gray-100 p-3 space-y-2">
                  {hospitalLocations.map((location, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        navigate("/locations");
                        setLocationOpen(false);
                        setMobileMenuOpen(false);
                      }}
                      className="w-full text-left rounded-xl px-3 py-2 text-sm text-gray-700 hover:bg-white transition"
                    >
                      {location}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </nav>

    </header>
  );
}

export default Header;