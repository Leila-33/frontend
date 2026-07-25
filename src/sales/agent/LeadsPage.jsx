import MyLeadsPage from "./MyLeadsPage";
import AvailableLeadsPage from "./AvailableLeadsPage";
import { useLocation } from "react-router-dom";


export default function LeadsPage() {
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const filter = params.get("filter") || "my";

  if (filter === "unassigned") {
    return <AvailableLeadsPage />;
  }

  return <MyLeadsPage />;
}