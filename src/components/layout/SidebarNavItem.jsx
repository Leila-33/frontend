import React from "react";
import { NavLink } from "react-router-dom";

export default function SidebarNavItem({
  to,
  icon,
  children,
  onClick,
  active,
  end = false,
}) {
  const navItemClass = (isActive) =>
    `nav-link d-flex align-items-center gap-3 px-3 py-3 rounded-4 transition ${
      isActive ? "bg-dark text-white shadow-sm" : "text-dark hover-bg-light"
    }`;

  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        navItemClass(active !== undefined ? active : isActive)
      }
      onClick={onClick}
    >
      <i className={`${icon} fs-5`} />

      <span>{children}</span>
    </NavLink>
  );
}
