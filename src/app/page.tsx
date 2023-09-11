"use client"

import React, { useState } from 'react';

export default function Home() {
  const [word, setWord] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  
  const fetchGrammarSuggestions = async () => {
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

      setSuggestions(data.matches);
    } catch (error) {
      console.error('Erro ao buscar sugestões:', error);
    }
  };

  return (
    <div>
      <input 
        type="text" 
        value={word}
        onChange={(e) => setWord(e.target.value)}
        placeholder="Digite uma frase para verificação gramatical"
      />
      <button onClick={fetchGrammarSuggestions}>Verificar Gramática</button>
      {suggestions.length > 0 && (
        <div>
          <h2>Sugestões:</h2>
          <ul>
            {suggestions.map((suggestion, index) => (
              <li key={index}>
                <strong>{suggestion.message}</strong>
                <ul>
                  <strong>Sugestões</strong>
                  {suggestion.replacements.map((replacement, idx) => (
                    <li key={idx}>{replacement.value}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
