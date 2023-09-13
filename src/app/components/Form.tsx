import { useState, ChangeEvent, useEffect } from 'react';
import styles from './Form.module.css';

interface PromptFormProps {
  onSubmit: () => void; // Alterado para não aceitar argumentos
  isLoading: boolean;
  setValue: (value: string) => void;
  value: string;
  placeholderText: string;
  showButton?: boolean; // Nova propriedade
}

export function Form ({ onSubmit, isLoading, setValue, value, placeholderText, showButton }: PromptFormProps){
  const [prompt, setPrompt] = useState<string>(value); // Inicializado com 'value'

  /*const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (prompt === '') {
      return;
    }

    onSubmit(); // Chamada sem argumentos
    setPrompt(''); 
  }; */

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
  
  useEffect(() => {
    setPrompt(value);
  }, [value]);

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
