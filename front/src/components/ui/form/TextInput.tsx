import {
  UseFormRegister,
  Path,
  FieldValues,
  FieldError,
} from "react-hook-form";

interface TextInputProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>;
  label: string;
  register: UseFormRegister<TFieldValues>;
  error?: FieldError;
  type?: "text" | "textarea";
  placeholder?: string;
}

export const TextInput = <TFieldValues extends FieldValues>({
  name,
  label,
  register,
  error,
  type = "text",
  placeholder,
}: TextInputProps<TFieldValues>) => (
  <div className="flex flex-col gap-1">
    <label htmlFor={name} className="font-medium text-gray-700">
      {label}
    </label>
    {type === "textarea" ? (
      <textarea
        id={name}
        {...register(name)}
        rows={4}
        placeholder={placeholder}
        className="w-full rounded-md border border-gray-200 px-2 py-3 focus:outline-gray-400 disabled:bg-gray-100"
      />
    ) : (
      <input
        id={name}
        type="text"
        {...register(name)}
        placeholder={placeholder}
        className="w-full rounded-md border border-gray-200 px-2 py-3 focus:outline-gray-400 disabled:bg-gray-100"
      />
    )}
    {error?.message && <p className="text-sm text-red-500">{error.message}</p>}
  </div>
);
