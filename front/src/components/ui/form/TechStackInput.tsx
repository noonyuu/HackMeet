import { useController, Control, Path, FieldValues } from "react-hook-form";
import { GET_SKILLS } from "@/graph/skill";
import { Skill } from "@/types/skill";
import { useMemo, useState } from "react";
import { useQuery } from "@apollo/client";

interface TechStackInputProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>;
  control: Control<TFieldValues>;
}

export const TechStackInput = <TFieldValues extends FieldValues>({
  name,
  control,
}: TechStackInputProps<TFieldValues>) => {
  const { field, fieldState } = useController({ name, control });
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { data: skillsData, loading: skillsLoading } = useQuery(GET_SKILLS);

  const techOptions = useMemo(
    () =>
      skillsData?.skills.map((s: Skill) => ({ value: s.id, label: s.name })) ||
      [],
    [skillsData],
  );
  const selectedTechs: string[] = useMemo(
    () => (Array.isArray(field.value) ? field.value : []),
    [field.value]
  );

  const suggestions = useMemo(() => {
    if (!inputValue) return [];
    return techOptions.filter(
      (opt: { value: string; label: string }) =>
        opt.label.toLowerCase().includes(inputValue.toLowerCase()) &&
        !selectedTechs.includes(opt.value),
    );
  }, [inputValue, techOptions, selectedTechs]);

  const handleSelect = (techId: string) => {
    field.onChange([...selectedTechs, techId]);
    setInputValue("");
    setShowSuggestions(false);
  };

  const handleRemove = (techId: string) => {
    field.onChange(selectedTechs.filter((id) => id !== techId));
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="font-medium text-gray-700">技術スタック</label>
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          placeholder={skillsLoading ? "読込中..." : "例: React"}
          className="w-full rounded-md border border-gray-200 px-2 py-2 focus:outline-gray-400 disabled:bg-gray-100"
        />
        {showSuggestions && suggestions.length > 0 && (
          <ul className="absolute z-10 mt-1 max-h-40 w-full overflow-y-auto rounded-md border border-gray-300 bg-white shadow">
            {suggestions.map((opt: { value: string; label: string }) => (
              <li key={opt.value}>
                <button
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  className="w-full px-3 py-2 text-left hover:bg-gray-100"
                >
                  {opt.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {selectedTechs.map((id) => {
          const tech = techOptions.find(
            (opt: { value: string }) => opt.value === id,
          );
          return (
            <div
              key={id}
              className="flex items-center gap-1 rounded-full bg-gray-200 px-3 py-1 text-sm"
            >
              <span>{tech?.label || id}</span>
              <button
                type="button"
                onClick={() => handleRemove(id)}
                className="text-gray-600 hover:text-red-500"
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
      {fieldState.error && (
        <p className="text-sm text-red-500">{fieldState.error.message}</p>
      )}
    </div>
  );
};
