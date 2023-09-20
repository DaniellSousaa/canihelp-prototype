import { useState, ChangeEvent, useEffect } from "react";
import styles from "./Form.module.css";

interface PromptFormProps {
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
  setValue?: (value: string) => void;
  value?: string;
  placeholderText: string;
  showButton?: boolean;
  disabled?: boolean;
}

export function Form({
  onSubmit,
  isLoading,
  setValue,
  value,
  placeholderText,
  showButton,
  disabled = false,
}: PromptFormProps) {
  const [prompt, setPrompt] = useState<string>(value || "");

  const handleClick = () => {
    if (prompt === "") {
      return;
    }
    onSubmit(prompt);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newPrompt = e.target.value;
    setPrompt(newPrompt);
    setValue && setValue(newPrompt);
  };

  useEffect(() => {
    value && setPrompt(value);
  }, [value]);

  return (
    <div className={styles.Card}>
      <input
        className={styles.input}
        type="text"
        value={prompt}
        onChange={handleChange}
        placeholder={value ? value : placeholderText}
        disabled={disabled}
      />
      {showButton && (
        <button
          className={styles.submitButton}
          disabled={isLoading || disabled}
          onClick={handleClick}
        >
          Pesquisar
        </button>
      )}
    </div>
  );
}
