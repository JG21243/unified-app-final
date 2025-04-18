import { ExternalLinkIcon, FileText } from "lucide-react";

export type Annotation = {
  type: "file_citation" | "url_citation";
  fileId?: string;
  url?: string;
  title?: string;
  filename?: string;
  index?: number;
};

const AnnotationPill = ({ annotation }: { annotation: Annotation }) => {
  const baseClassName = "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium shadow-sm transition-all";

  switch (annotation.type) {
    case "file_citation":
      return (
        <div className={`${baseClassName} bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/50`}>
          <FileText size={12} />
          <span className="truncate max-w-40">{annotation.filename}</span>
        </div>
      );
    case "url_citation":
      return (
        <a
          target="_blank"
          rel="noopener noreferrer"
          href={annotation.url}
          className={`${baseClassName} bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/50`}
        >
          <div className="flex items-center gap-1.5">
            <div className="truncate max-w-40">{annotation.title || annotation.url}</div>
            <ExternalLinkIcon size={12} className="shrink-0" />
          </div>
        </a>
      );
  }
};

const Annotations = ({ annotations }: { annotations: Annotation[] }) => {
  const uniqueAnnotations = annotations.reduce(
    (acc: Annotation[], annotation) => {
      if (
        !acc.some(
          (a: Annotation) =>
            a.type === annotation.type &&
            ((annotation.type === "file_citation" &&
              a.fileId === annotation.fileId) ||
              (annotation.type === "url_citation" && a.url === annotation.url))
        )
      ) {
        acc.push(annotation);
      }
      return acc;
    },
    []
  );

  if (uniqueAnnotations.length === 0) {
    return null;
  }

  return (
    <div className="mt-2 mb-4">
      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 ml-4">Sources:</div>
      <div className="flex flex-wrap max-w-full mr-28 ml-4 gap-2 pb-1">
        {uniqueAnnotations.map((annotation: Annotation, index: number) => (
          <AnnotationPill key={index} annotation={annotation} />
        ))}
      </div>
    </div>
  );
};

export default Annotations;
