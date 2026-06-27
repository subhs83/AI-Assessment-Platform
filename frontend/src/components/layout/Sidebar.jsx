import { NavLink, useParams } from "react-router-dom";
import { getSidebarMenu } from "../../menus";
import { useAuthStore } from "../../store/authStore";

export default function Sidebar({ open }) {
  const { schoolSlug } = useParams();

  const user = useAuthStore((s) => s.user);

  const menu = user ? getSidebarMenu(user.role, schoolSlug) : [];

  return (
    <aside
      className={`
        flex flex-col
        bg-zinc-900
        border-r border-zinc-800
        text-white
        transition-all
        duration-300
        ease-in-out
        ${open ? "w-64" : "w-15"}
      `}
    >
      <nav className="flex-1 overflow-y-auto px-3 py-5">

        {menu.map((item, idx) => {

          if (item.action === "logout") {
            return null;
          }

          if (item.type === "section") {
            return open ? (
              <div
                key={idx}
                className="mt-6 mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500"
              >
                {item.label}
              </div>
            ) : (
              <div key={idx} className="mt-6" />
            );
          }

          if (item.type === "divider") {
            return (
              <div
                key={idx}
                className="my-4 border-t border-zinc-800"
              />
            );
          }

          return (
            <NavLink
              key={idx}
              to={item.path}
              end={item.end ?? false}
              className={({ isActive }) =>
                `
                group
                mb-1
                flex
                items-center
                gap-4
                rounded-2xl
                px-4
                py-3
                text-sm
                font-medium
                transition-all
                duration-200

                ${
                  isActive
                    ? "bg-white/10 text-white border border-white/10 shadow-sm"
                    : "text-zinc-300 hover:bg-white/5 hover:text-white"
                }
                `
              }
            >
              <item.icon
                size={20}
                className="flex-shrink-0"
              />

              {open && (
                <span className="truncate">
                  {item.label}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}