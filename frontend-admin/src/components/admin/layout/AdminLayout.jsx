import { useState } from "react";
import Sidebar from "./Sidebar";
import { HiOutlineMenu} from "react-icons/hi";
import { useTheme } from "../../../context/ThemeContext";

export default function AdminLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);


  

  return (
    <div
  className="
    flex
    min-h-screen
    bg-[radial-gradient(circle_at_center,rgba(202,240,248,0.8)_0%,rgba(255,255,255,1)_100%)]
     dark:bg-[radial-gradient(circle_at_center,#001d3d_0%,#000814_85%)]
    
    transition-colors
  "
>
      
      {/* MOBILE TOP BAR */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white dark:bg-gray-800 shadow flex items-center justify-between px-4 z-50 transition-colors">
        
        <div className="flex items-center">
          <button
            onClick={() => setMobileOpen(true)}
            className="text-2xl text-gray-800 dark:text-white"
          >
            <HiOutlineMenu />
          </button>

          <span className="ml-3 font-bold text-blue-700 dark:text-blue-400">
            Admin
          </span>
        </div>

        
      </div>

      {/* SIDEBAR */}
      <Sidebar
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* MAIN */}
     <main
  className="
    flex-1
    p-4
    md:p-6
    mt-14
    md:mt-0
    bg-transparent
    text-gray-900
    dark:text-gray-100
    transition-colors
  "
>
        {children}
      </main>
    </div>
  );
}