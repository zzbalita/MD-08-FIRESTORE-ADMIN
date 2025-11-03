import { useState, createContext } from "react";
import Sidebar from "../components/Sidebar";

export const StatisticsContext = createContext();

export default function AdminLayout({ children }) {
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefreshStatistics = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <StatisticsContext.Provider value={{ refreshKey, triggerRefreshStatistics }}>
      <div style={{ display: "flex" }}>
        <Sidebar />
        <div
          style={{
            marginLeft: 230,
            padding: "0px",
            width: "100%",
            height: "100%",
            backgroundImage: `url("/images/Bgr_web.jpg")`,
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
          }}
        >
          {children}
        </div>
      </div>
    </StatisticsContext.Provider>
  );
}
