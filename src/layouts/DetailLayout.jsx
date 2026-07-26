import Breadcrumb from "../components/navigation/Breadcrumb";

import { useNavigate } from "react-router-dom";

export default function DetailLayout({
  breadcrumb = [],
  actions,
  children
}) {

  const navigate = useNavigate();

  return (
    <div className="container py-4">

      {/* HEADER DETAIL */}
      <div className="d-flex justify-content-between align-items-center mb-4">

        <div className="d-flex align-items-center">

          <button
            className="btn btn-light btn-sm rounded-circle me-3 shadow-sm"
            onClick={() => navigate(-1)}
          >
            <i className="bi bi-arrow-left"></i>
          </button>


          <Breadcrumb items={breadcrumb}/>

        </div>


        {/* ACTIONS */}
        {actions && (
          <div className="d-flex gap-2">
            {actions}
          </div>
        )}

      </div>


      {/* CONTENT */}
      {children}

    </div>
  );
}