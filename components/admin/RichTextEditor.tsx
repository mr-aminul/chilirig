"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Enter text...",
  className = "",
}: RichTextEditorProps) {
  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ align: [] }],
        ["link"],
        ["clean"],
      ],
    }),
    []
  );

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "align",
    "link",
  ];

  return (
    <div className={`rich-text-editor ${className}`}>
      <style jsx global>{`
        .rich-text-editor .ql-container {
          font-size: 14px;
          min-height: 150px;
          border-bottom-left-radius: 0.5rem;
          border-bottom-right-radius: 0.5rem;
        }
        .rich-text-editor .ql-toolbar {
          border-top-left-radius: 0.5rem;
          border-top-right-radius: 0.5rem;
          border: 1px solid rgba(0, 0, 0, 0.1);
          background: rgba(255, 255, 255, 0.6);
        }
        .rich-text-editor .ql-container {
          border: 1px solid rgba(0, 0, 0, 0.1);
          border-top: none;
          background: rgba(255, 255, 255, 0.6);
        }
        .rich-text-editor .ql-editor {
          min-height: 150px;
        }
        .rich-text-editor .ql-editor.ql-blank::before {
          color: hsl(var(--text-muted));
          font-style: normal;
        }
      `}</style>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
      />
    </div>
  );
}
