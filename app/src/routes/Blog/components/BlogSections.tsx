import clsx from "clsx";
import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useRef,
} from "react";
import { Anchor } from "../../../components/Anchor";
import { Sep } from "../../../components/Sep";

interface SectionContextType {
  addSection: (section: { id: string; title: string; level: number }) => void;
}

const SectionContext = createContext<SectionContextType | null>(null);

interface SectionProps {
  title: string;
  level?: 2 | 3;
  children: ReactNode;
  id?: string;
  className?: string;
}

export function Section({
  title,
  level = 2,
  children,
  id: providedId,
  className,
}: SectionProps) {
  const context = useContext(SectionContext);
  const id = providedId || title.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  useEffect(() => {
    context?.addSection({ id, title, level });
  }, [context, id, title, level]);

  return (
    <>
      <Anchor id={id} className={clsx(className, `heading-${level}`)}>
        <h1 className={clsx(className, "font-bold text-2xl")}>{title}</h1>
      </Anchor>
      <p className="p-2">{children}</p>
      <Sep className={"my-4"} showLine={true} />
    </>
  );
}

interface BlogContentProps {
  onSectionsChange: (
    sections: Array<{ id: string; title: string; level: number }>,
  ) => void;
  children: ReactNode;
}

export function BlogContent({ onSectionsChange, children }: BlogContentProps) {
  const sectionsRef = useRef<
    Array<{ id: string; title: string; level: number }>
  >([]);

  const addSection = (section: {
    id: string;
    title: string;
    level: number;
  }) => {
    // Check if section already exists
    if (!sectionsRef.current.some((s) => s.id === section.id)) {
      sectionsRef.current.push(section);
      // Sort sections by their appearance in the document
      sectionsRef.current.sort((a, b) => {
        const aEl = document.getElementById(a.id);
        const bEl = document.getElementById(b.id);
        if (!aEl || !bEl) return 0;
        return aEl.compareDocumentPosition(bEl) &
          Node.DOCUMENT_POSITION_FOLLOWING
          ? -1
          : 1;
      });
      onSectionsChange([...sectionsRef.current]);
    }
  };

  return (
    <SectionContext.Provider value={{ addSection }}>
      <article className="text-gray-400">{children}</article>
    </SectionContext.Provider>
  );
}
