import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";

interface Section {
  id: string;
  title: string;
  level: number;
}

export function TableOfContents({ sections }: { sections: Section[] }) {
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    // Create observer
    const observer = new IntersectionObserver(
      (entries) => {
        // Find first section that's more than 50% visible
        const visible = entries.find((entry) => entry.intersectionRatio > 0.5);
        if (visible) {
          setActiveId(visible.target.id);
        }
      },
      { threshold: 0.5 },
    );

    // Observe all sections
    for (const section of sections) {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    }

    return () => observer.disconnect();
  }, [sections]);

  if (!sections.length) return null;

  const onClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setActiveId(id);
      window.history.pushState({}, "", `#${id}`);
    }
  };

  return (
    <div className="relative hidden w-64 shrink-0 lg:block">
      <nav className="sticky top-24 rounded-lg bg-gray-900 p-4">
        <div className="overflow-y-auto">
          <ul className="space-y-2">
            {sections.map(({ id, title, level }) => (
              <li key={id} style={{ paddingLeft: `${(level - 2) * 1}rem` }}>
                <button
                  type="button"
                  onClick={() => onClick(id)}
                  className={`text-left text-sm hover:text-cyan-400 ${
                    activeId === id ? "text-cyan-500" : "text-gray-400"
                  }`}
                >
                  <FontAwesomeIcon
                    className="mr-1"
                    icon={faCircleNotch}
                    size="xs"
                  />{" "}
                  {title}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </div>
  );
}
