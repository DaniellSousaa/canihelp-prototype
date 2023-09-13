import { useState, ChangeEvent, useEffect } from 'react';
import styles from './Form.module.css';

interface PromptFormProps {
  onSubmit: () => void; // Alterado para não aceitar argumentos
  isLoading: boolean;
  setValue: (value: string) => void;
  value: string;
  placeholderText: string;
  showButton?: boolean;
}

export function Form ({ onSubmit, isLoading, setValue, value, placeholderText, showButton }: PromptFormProps){
  const [prompt, setPrompt] = useState<string>(value); 

  const handleClick = () => {
    if (prompt === '') {
      return;
    }
    onSubmit();
    setPrompt('');
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newPrompt = e.target.value;
    setPrompt(newPrompt);
    setValue(newPrompt); // Atualiza o valor no componente pai
  };
  
 

  return (
    <form className={styles.Card}>
      <input
        className={styles.input}
        type="text"
        value={prompt} // Campo de entrada agora é controlado
        onChange={handleChange}
        placeholder={value ? value : placeholderText}
      />
      {showButton && (
        <input
          className={styles.submitButton}
          type="button"
          value="Pesquisar"
          disabled={isLoading}
          onClick={handleClick}
        />
      )}
    </form>
  );
};
