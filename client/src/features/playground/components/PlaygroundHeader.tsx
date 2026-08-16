"use client";

import { useEffect, useRef, useState } from "react";
import { Link } from "@/core/lib/i18n/navigation";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePlaygroundStore } from "../store/usePlaygroundStore";

export function PlaygroundHeader() {
  const t = useTranslations("playground");
  const { course, setTitle } = usePlaygroundStore();
  const [editing, setEditing] = useState(false);
  const [titleInput, setTitleInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  if (!course) return null;

  const startEditing = () => {
    setTitleInput(course.title);
    setEditing(true);
  };

  const save = () => {
    const trimmed = titleInput.trim();
    setTitle(trimmed || course.title);
    setEditing(false);
  };

  return (
    <div className="flex flex-col gap-2 px-4 md:px-6 py-4 border-b border-border-base bg-bg-surface/60 shrink-0">
      <Link
        href="/grades"
        data-tour="playground-back"
        className="inline-flex items-center gap-1.5 w-fit text-xs font-medium text-text-muted hover:text-text-primary transition-colors"
      >
        <ArrowLeft size={14} />
        {t("back_to_grades")}
      </Link>

      <span className="text-[10px] font-semibold text-text-accent uppercase tracking-wider">
        {t("page_title")}
      </span>

      {editing ? (
        <input
          ref={inputRef}
          data-tour="playground-title"
          value={titleInput}
          onChange={(e) => setTitleInput(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => {
            if (e.key === "Enter") save();
            if (e.key === "Escape") setEditing(false);
          }}
          maxLength={300}
          className="text-xl md:text-2xl font-bold bg-transparent border-b-2 border-border-accent text-text-primary focus:outline-none w-full max-w-md"
        />
      ) : (
        <h1
          data-tour="playground-title"
          onDoubleClick={startEditing}
          title={t("title_hint")}
          className="text-xl md:text-2xl font-bold text-text-primary cursor-text w-fit"
        >
          {course.title}
        </h1>
      )}
    </div>
  );
}
