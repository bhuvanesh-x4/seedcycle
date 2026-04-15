import Home from "../pages/Home.jsx";
import Auth from "../pages/Auth.jsx";
import Dashboard from "../pages/Dashboard.jsx";
import Marketplace from "../pages/Marketplace.jsx";
import ListingCreate from "../pages/ListingCreate.jsx";
import Exchanges from "../pages/Exchanges.jsx";
import Feed from "../pages/Feed.jsx";
import Profile from "../pages/Profile.jsx";
import ListingDetails from "../pages/ListingDetails.jsx";
import CompanyVerification from "../pages/CompanyVerification.jsx";
import WeatherGuide from "../pages/WeatherGuide.jsx";
import Analytics from "../pages/Analytics.jsx";


export const routes = [
  { path: "/", element: <Home /> },
  { path: "/auth", element: <Auth /> },
  { path: "/dashboard", element: <Dashboard /> },
  { path: "/market", element: <Marketplace /> },
  { path: "/list", element: <ListingCreate /> },
  { path: "/exchanges", element: <Exchanges /> },
  { path: "/feed", element: <Feed /> },
  { path: "/listing/:id", element: <ListingDetails /> },
  { path: "/company-verification", element: <CompanyVerification /> },
  { path: "/weather", element: <WeatherGuide /> },
  { path: "/analytics", element: <Analytics /> },

  { path: "/profile", element: <Profile /> }
];
