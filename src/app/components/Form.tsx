import { useState, FormEvent, ChangeEvent } from 'react';
import styles from './Form.module.css';

interface PromptFormProps {
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
}

export function Form ({ onSubmit, isLoading }: PromptFormProps){
  const [prompt, setPrompt] = useState<string>('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (prompt === '') {
      return;
    }

    onSubmit(prompt);
    setPrompt('');
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPrompt(e.target.value);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.Card}>
      <input
        className={styles.input}
        type="text"
        value={prompt}
        onChange={handleChange}
        placeholder="Pesquisar..."
      />
      <input
        className={styles.submitButton}
        type="submit"
        disabled={isLoading}
      />
    </form>
  );
};


