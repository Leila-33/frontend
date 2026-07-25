import { Link } from "react-router-dom";
import { BsChevronRight } from "react-icons/bs";

export default function Breadcrumb({
  items = []
}) {

  return (

    <nav
      aria-label="breadcrumb"
      className="mb-4"
    >

      <div className="d-flex align-items-center flex-wrap gap-2 small">

        {items.map((item, index) => {

          const isLast =
            index === items.length - 1;

          return (

            <div
              key={index}
              className="d-flex align-items-center gap-2"
            >

              {isLast ? (

                <span
                  className="fw-semibold text-dark"
                >
                  {item.label}
                </span>

              ) : (

                <Link
                  to={item.path}
                  className="
                    text-decoration-none
                    text-secondary
                  "
                  style={{
                    transition: "color .2s"
                  }}
                >
                  {item.label}
                </Link>

              )}

              {!isLast && (
                <BsChevronRight
                  size={12}
                  className="text-muted"
                />
              )}

            </div>

          );

        })}

      </div>

    </nav>

  );

} 