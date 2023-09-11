"use client"

import React, { useState, useEffect, useCallback } from 'react';

export default function Home() {
  const [word, setWord] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchGrammarSuggestions = useCallback(async () => {
    try {
      const apiUrl = 'https://api.languagetool.org/v2/check';
      const requestBody = new URLSearchParams();
      requestBody.append("text", word);
      requestBody.append("language", "pt-Br");

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: requestBody
      });

      if (!response.ok) {
        console.error('Erro na resposta:', response.statusText);
        return;
      }

      const data = await response.json();
      if (!data || !data.matches) {
        console.error('Dados vazios ou formato inesperado');
        return;
      }
      //const topThreeSuggestions = data.matches.slice(0, 3)

      setSuggestions(data.matches);
      //console.log(suggestions)
    } catch (error) {
      console.error('Erro ao buscar sugestões:', error);
    }
  }, [ word]);


  useEffect(() => {
    const timer = setTimeout(async () => {
      if (word) {
        await fetchGrammarSuggestions();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [fetchGrammarSuggestions, word]); 

  return (
    <div>
      <input 
        type="text" 
        value={word}
        onChange={(e) => setWord(e.target.value)}
        placeholder="Digite uma frase para verificação gramatical"
      />
      <button onClick={fetchGrammarSuggestions}>Verificar Gramática</button>
<div>
  {suggestions.length > 0 && (
    <div>
      <h2>Sugestões:</h2>
      <ul>
        {suggestions.map((suggestion, index) => (
          <li key={index}>
            <strong>{suggestion.message}</strong>
            <ul>
              {suggestion.replacements.slice(0,3).map((replacement, index) => replacement.value).join(', ')}
            </ul>
          </li>
        ))}
      </ul>
      <div>
        <h2>Frase corrigida:</h2>
        <p>{suggestions.map((suggestion) => suggestion.replacements[0]?.value).join(' ')}</p>
      </div>
    </div>
  )}
</div>

    </div>
  );
}
