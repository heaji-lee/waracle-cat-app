import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, Button } from "@heroui/react";
import { HelpModal } from "./HelpModal";
import MooLogo from "../assets/images/moo.jpeg";

export default function Nav() {
  // State
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <div className="w-14 sm:w-40 md:w-60 bg-gray-800 text-white h-full flex flex-col p-4 sm:p-6 items-center z-50 font-[Galindo]">
      <Link to="/" className="w-full">
        <Card className="w-10 h-10 sm:w-20 sm:h-20 mb-6 mx-auto overflow-hidden rounded-5xl relative">
          <img
            src={MooLogo}
            alt="Cat Logo"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </Card>
      </Link>

      <ul className="flex flex-col gap-4 w-full mt-4">
        {[
          { to: "/", label: "Home", icon: "M2.25 12L10.204 3.045c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" },
          { to: "/upload", label: "Upload", icon: "M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" },
          { to: "/favourites", label: "Favourites", icon: "M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" },
        ].map((item) => (
          <li key={item.to} className="w-full">
            <Link
              to={item.to}
              className="flex items-center justify-center gap-0 sm:gap-2 w-full px-0 sm:px-4 py-2 rounded hover:bg-gray-700"
            >
              <div className="flex flex-col items-center gap-0 sm:gap-1">
                <div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                </div>

                <div>
                  <span className="hidden sm:inline">{item.label}</span>
                </div>
              </div>

            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-auto p-4">
        <Button variant="secondary" onClick={() => setHelpOpen(true)}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
          </svg>
          <span className="hidden sm:inline">Need help?</span>
        </Button>

        <HelpModal isOpen={helpOpen} setIsOpen={setHelpOpen} />
      </div>
    </div>
  )
}