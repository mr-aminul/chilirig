"use client";

import { useState, useRef, useEffect } from "react";
import { Edit2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";

const RichTextEditor = dynamic(() => import("./RichTextEditor"), { ssr: false });

interface EditableFieldProps {
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "textarea" | "number";
  placeholder?: string;
  className?: string;
  multiline?: boolean;
  richText?: boolean;
  onRichTextChange?: (value: string) => void;
}

export default function EditableField({
  value,
  onChange,
  type = "text",
  placeholder = "Click to edit...",
  className = "",
  multiline = false,
  richText = false,
  onRichTextChange,
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (type === "textarea" || multiline) {
        (inputRef.current as HTMLTextAreaElement).select();
      }
    }
  }, [isEditing, type, multiline]);

  const handleSave = () => {
    onChange(editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !multiline && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (richText && onRichTextChange) {
    return (
      <div className={`editable-field ${className}`}>
        {isEditing ? (
          <div className="space-y-2">
            <RichTextEditor
              value={editValue}
              onChange={(val) => {
                setEditValue(val);
                onRichTextChange(val);
              }}
              placeholder={placeholder}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave}>
                <Check className="h-4 w-4 mr-1" />
                Save
              </Button>
              <Button size="sm" variant="ghost" onClick={handleCancel}>
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div
            className="group relative cursor-pointer p-2 rounded hover:bg-muted/50 transition-colors"
            onClick={() => setIsEditing(true)}
          >
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: value || placeholder }}
            />
            <Button
              size="icon"
              variant="ghost"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className={`editable-field flex items-center gap-2 ${className}`}>
        {type === "textarea" || multiline ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            className="flex-1 rounded-lg border border-black/10 bg-white/60 backdrop-blur-sm px-4 py-2 text-sm min-h-[100px]"
            placeholder={placeholder}
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type={type}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            className="flex-1 rounded-lg border border-black/10 bg-white/60 backdrop-blur-sm px-4 py-2 text-sm h-11"
            placeholder={placeholder}
          />
        )}
        <Button size="icon" variant="ghost" onClick={handleSave}>
          <Check className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost" onClick={handleCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div
      className={`group relative cursor-pointer p-2 rounded hover:bg-muted/50 transition-colors ${className}`}
      onClick={() => setIsEditing(true)}
    >
      {value ? (
        <span className="text-sm">{value}</span>
      ) : (
        <span className="text-sm text-muted-foreground italic">{placeholder}</span>
      )}
      <Button
        size="icon"
        variant="ghost"
        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
      >
        <Edit2 className="h-3 w-3" />
      </Button>
    </div>
  );
}
