import { useState, useRef, useEffect, useMemo } from "react";
import { Sparkles, Plus, X, Search } from "lucide-react";
import { useEduPath } from "../context/EduPathContext";
import { getSkillSuggestions } from "../data/skillsCatalog";

export default function SkillInputWithSuggestions({
  value = "",
  onChange,
  targetRole = "",
  placeholder = "e.g. Excel, SQL, Python or HTML, CSS, JavaScript...",
  name = "currentSkills",
  required = false,
}) {
  const { availableSkills } = useEduPath();
  const [isFocused, setIsFocused] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const textareaRef = useRef(null);
  const dropdownRef = useRef(null);

  // Parse comma-separated string into trimmed non-empty skills
  const parsedSkills = useMemo(() => {
    return value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }, [value]);

  // Determine active query based on cursor position or text after the last comma
  const [activeQuery, setActiveQuery] = useState("");

  const updateActiveQuery = () => {
    if (!textareaRef.current) return;
    const cursorPos = textareaRef.current.selectionStart || value.length;
    const textBeforeCursor = value.slice(0, cursorPos);
    const lastComma = textBeforeCursor.lastIndexOf(",");
    const token = (
      lastComma === -1
        ? textBeforeCursor
        : textBeforeCursor.slice(lastComma + 1)
    ).trim();
    setActiveQuery(token);
    setHighlightedIndex(0);
  };

  // Recalculate suggestions dynamically as typing occurs
  const dynamicSuggestions = useMemo(() => {
    return getSkillSuggestions({
      query: activeQuery,
      existingSkills: parsedSkills,
      role: targetRole,
      catalog: availableSkills,
      maxResults: activeQuery ? 6 : 5,
    });
  }, [activeQuery, parsedSkills, targetRole, availableSkills]);

  // Recommended role skills when not actively searching a specific term
  const recommendedRoleSkills = useMemo(() => {
    return getSkillSuggestions({
      query: "",
      existingSkills: parsedSkills,
      role: targetRole,
      catalog: availableSkills,
      maxResults: 6,
    });
  }, [parsedSkills, targetRole, availableSkills]);

  // Insert a selected skill into the value string replacing active token
  const selectSkill = (skillName) => {
    const el = textareaRef.current;
    let newValue;
    let newCursorPos = 0;

    if (el) {
      const cursorPos = el.selectionStart ?? value.length;
      const textBeforeCursor = value.slice(0, cursorPos);
      const textAfterCursor = value.slice(cursorPos);
      const lastComma = textBeforeCursor.lastIndexOf(",");

      // Extract and normalize skills before the active token's preceding comma
      const prefixText = lastComma === -1 ? "" : textBeforeCursor.slice(0, lastComma);
      const prefixItems = prefixText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const prefixStr = prefixItems.length > 0 ? `${prefixItems.join(", ")}, ` : "";

      // Extract and normalize skills after the cursor
      const suffixItems = textAfterCursor
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      if (suffixItems.length > 0) {
        newValue = `${prefixStr}${skillName}, ${suffixItems.join(", ")}`;
        newCursorPos = `${prefixStr}${skillName}, `.length;
      } else {
        newValue = `${prefixStr}${skillName}, `;
        newCursorPos = newValue.length;
      }
    } else {
      const existing = parsedSkills.filter(
        (s) => s.toLowerCase() !== skillName.toLowerCase()
      );
      newValue = `${[...existing, skillName].join(", ")}, `;
      newCursorPos = newValue.length;
    }

    if (onChange) {
      onChange({ target: { name, value: newValue } });
    }

    setActiveQuery("");
    setHighlightedIndex(-1);

    // Maintain focus and set cursor position cleanly
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 10);
  };

  // Add skill directly (e.g. from pill clicks)
  const addSkillDirect = (skillName) => {
    if (parsedSkills.some((s) => s.toLowerCase() === skillName.toLowerCase())) {
      return;
    }
    const existing = value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    // If the last item was partially typed and matches the start of skillName, replace it
    const last = existing[existing.length - 1];
    if (last && skillName.toLowerCase().startsWith(last.toLowerCase())) {
      existing[existing.length - 1] = skillName;
    } else {
      existing.push(skillName);
    }

    const newValue = `${existing.join(", ")}, `;
    if (onChange) {
      onChange({ target: { name, value: newValue } });
    }
    setActiveQuery("");
    if (textareaRef.current) {
      textareaRef.current.focus();
      const pos = newValue.length;
      textareaRef.current.setSelectionRange(pos, pos);
    }
  };

  // Remove a specific skill tag
  const removeSkill = (skillToRemove) => {
    const remaining = parsedSkills.filter(
      (s) => s.toLowerCase() !== skillToRemove.toLowerCase()
    );
    const newValue = remaining.length > 0 ? `${remaining.join(", ")}, ` : "";
    if (onChange) {
      onChange({ target: { name, value: newValue } });
    }
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Keyboard navigation inside textarea
  const handleKeyDown = (e) => {
    const isDropdownOpen = isFocused && activeQuery.length > 0 && dynamicSuggestions.length > 0;

    if (isDropdownOpen) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < dynamicSuggestions.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : dynamicSuggestions.length - 1
        );
      } else if (e.key === "Enter" || e.key === "Tab") {
        const targetSuggestion =
          highlightedIndex >= 0 && highlightedIndex < dynamicSuggestions.length
            ? dynamicSuggestions[highlightedIndex]
            : dynamicSuggestions[0];
        if (targetSuggestion) {
          e.preventDefault();
          selectSkill(targetSuggestion.name);
        }
      } else if (e.key === "Escape") {
        setActiveQuery("");
      }
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        textareaRef.current &&
        !textareaRef.current.contains(e.target)
      ) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const showDropdown =
    isFocused && activeQuery.length >= 1 && dynamicSuggestions.length > 0;

  return (
    <div className="relative space-y-2">
      {/* Selected skill tags preview */}
      {parsedSkills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 p-2 rounded bg-zinc-50 border border-zinc-200/80">
          <div className="w-full flex items-center justify-between text-[11px] text-zinc-400 mb-0.5">
            <span>
              {parsedSkills.length} selected {parsedSkills.length === 1 ? "skill" : "skills"}:
            </span>
            <span className="text-[10px]">Click × to remove</span>
          </div>
          {parsedSkills.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-white text-zinc-800 border border-zinc-200 shadow-xs transition-all hover:border-zinc-300"
            >
              <span>{skill}</span>
              <button
                type="button"
                onClick={() => removeSkill(skill)}
                className="text-zinc-400 hover:text-zinc-700 focus:outline-none ml-0.5"
                title={`Remove ${skill}`}
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input / Textarea with Auto-suggestions */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          name={name}
          value={value}
          onChange={(e) => {
            // Prevent duplicate commas e.g. ",," -> ","
            const sanitized = e.target.value.replace(/,{2,}/g, ",");
            if (onChange) {
              onChange({ target: { name, value: sanitized } });
            }
            updateActiveQuery();
          }}
          onKeyUp={updateActiveQuery}
          onClick={updateActiveQuery}
          onFocus={() => {
            setIsFocused(true);
            updateActiveQuery();
          }}
          onKeyDown={handleKeyDown}
          rows={3}
          required={required && parsedSkills.length === 0}
          placeholder={placeholder}
          className="w-full text-xs p-2.5 rounded border border-zinc-200 bg-white text-zinc-900 outline-none focus:border-zinc-400 transition resize-none leading-relaxed"
        />

        {/* Dynamic floating autocomplete suggestions */}
        {showDropdown && (
          <div
            ref={dropdownRef}
            className="absolute left-0 right-0 z-30 mt-1 bg-white border border-zinc-200 rounded-md shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150"
          >
            <div className="px-3 py-1.5 bg-zinc-50 border-b border-zinc-100 flex items-center justify-between text-[11px] text-zinc-500 font-medium">
              <span className="flex items-center gap-1.5">
                <Search size={12} className="text-zinc-400" />
                <span>Matching suggestions for &ldquo;{activeQuery}&rdquo;</span>
              </span>
              <span className="text-[10px] text-zinc-400">
                Press <kbd className="px-1 py-0.5 rounded bg-zinc-200/70 font-mono text-[9px]">Enter</kbd> or click to select
              </span>
            </div>

            <ul className="max-h-52 overflow-y-auto divide-y divide-zinc-50 py-1">
              {dynamicSuggestions.map((item, index) => {
                const isSelected = index === highlightedIndex;
                const nameLower = item.name.toLowerCase();
                const qLower = activeQuery.toLowerCase();
                const matchIdx = nameLower.indexOf(qLower);

                return (
                  <li
                    key={item.name}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    onMouseDown={(e) => {
                      e.preventDefault(); // Prevent blur before selection
                      selectSkill(item.name);
                    }}
                    className={`px-3 py-2 text-xs flex items-center justify-between cursor-pointer transition ${
                      isSelected ? "bg-zinc-100 text-zinc-950" : "text-zinc-700 hover:bg-zinc-50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {matchIdx !== -1 ? (
                          <>
                            {item.name.slice(0, matchIdx)}
                            <span className="text-blue-600 underline font-semibold">
                              {item.name.slice(matchIdx, matchIdx + activeQuery.length)}
                            </span>
                            {item.name.slice(matchIdx + activeQuery.length)}
                          </>
                        ) : (
                          item.name
                        )}
                      </span>
                      {item.category && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-500 border border-zinc-200/60 font-normal">
                          {item.category}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                      <Plus size={12} />
                      <span>Add</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      {/* Dynamic Suggestions & Quick-Add Pills Bar */}
      <div className="pt-0.5">
        {activeQuery.length >= 1 ? (
          // While typing: show immediate matching suggestion chips
          dynamicSuggestions.length > 0 && (
            <div className="flex flex-wrap gap-1.5 items-center">
              <span className="text-[11px] text-zinc-400 flex items-center gap-1 mr-0.5">
                <Sparkles size={11} className="text-amber-500" />
                <span>Suggestions:</span>
              </span>
              {dynamicSuggestions.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    selectSkill(item.name);
                  }}
                  className="px-2 py-0.5 rounded text-[11px] font-medium border border-blue-200 bg-blue-50/60 hover:bg-blue-100/80 text-blue-800 transition flex items-center gap-1 shadow-2xs"
                >
                  <Plus size={10} className="text-blue-600" />
                  <span>{item.name}</span>
                </button>
              ))}
            </div>
          )
        ) : (
          // When idle / not typing: show recommended skills for the target role
          recommendedRoleSkills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 items-center">
              <span className="text-[11px] text-zinc-400 flex items-center gap-1 mr-0.5">
                <Sparkles size={11} className="text-zinc-400" />
                <span>Recommended for {targetRole || "your role"}:</span>
              </span>
              {recommendedRoleSkills.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    addSkillDirect(item.name);
                  }}
                  className="px-2 py-0.5 rounded text-[11px] border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 transition flex items-center gap-1"
                >
                  <Plus size={10} className="text-zinc-500" />
                  <span>{item.name}</span>
                </button>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
