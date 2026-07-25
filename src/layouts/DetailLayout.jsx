import Breadcrumb from "../components/navigation/Breadcrumb";

export default function DetailLayout({
  breadcrumb,
  children
}) {


  return (

    <div className="container py-4">

      <div className="d-flex align-items-center mb-4">

        <Breadcrumb items={breadcrumb} />

      </div>

      {children}

    </div>

  );

}