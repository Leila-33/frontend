import { useContext } from "react";
import { LoaderContext } from "../context/LoaderContext";

export default function GlobalLoader() {
  const { loading } = useContext(LoaderContext);

  if (!loading) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "rgba(0,0,0,0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999
    }}>
      <div className="spinner-border text-light"></div>
    </div>
  );
}
