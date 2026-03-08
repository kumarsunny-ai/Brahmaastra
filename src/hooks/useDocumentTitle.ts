import { useEffect } from "react";

/**
 * Sets the document title for SEO. Appends " — Brahmaastra" suffix.
 */
const useDocumentTitle = (title: string) => {
  useEffect(() => {
    const prev = document.title;
    document.title = title.includes("Brahmaastra") ? title : `${title} — Brahmaastra`;
    return () => { document.title = prev; };
  }, [title]);
};

export default useDocumentTitle;
