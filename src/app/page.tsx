"use client"; 

import styles from "./page.module.css";
import React, { useState } from "react";
import {Form} from "./components/Form";  

interface Choice {
  index: number;
  message: {
    content: string;
  };
}

const Home: React.FC = () => {
  const [chatGptResponse, setChatGptResponse] = useState<Choice[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  return (
    <main className={styles.main}>
      <div className={styles.card}>
        <Form
          isLoading={isLoading}
          onSubmit={async (prompt: string) => {
            setIsLoading(true);
            const response = await fetch("/api/chat-gpt", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                prompt,
              }),
            });

            setIsLoading(false);
            const result = await response.json();
            setChatGptResponse(result.choices);
          }}
          placeholderText="Digite algo com erro.."
          showButton
        />

        {chatGptResponse.map((choice: Choice) => {
          console.log(choice);
          return (
            <p className={styles.response} key={choice.index}>
              você quis dizer? <strong>{choice.message.content}</strong>
            </p>
          );
        })}
      </div>
    </main>
  );
}

export default Home;
