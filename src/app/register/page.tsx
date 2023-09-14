"use client";

import styles from "../page.module.css";
import React, { useState } from "react";
import { Form } from "../components/Form";

interface Choice {
  index: number;
  message: {
    content: string;
  };
}

async function fetchChatGptResponse(prompt: string): Promise<Choice[]> {
  const response = await fetch("/api/chat-gpt", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt,
    }),
  });

  if (!response.ok) {
    throw new Error("Falha na requisição à API");
  }

  const result = await response.json();
  return result.choices;
}

const Register: React.FC = () => {
  const [userName, setUserName] = useState<string>("");
  const [mainService, setMainService] = useState<string>("");
  const [otherServices, setOtherServices] = useState<string>("");
  const [otherServicesTags, setOtherServicesTags] = useState<string[]>([]);

  const [mainServiceResponse, setMainServiceResponse] = useState<Choice[]>([]);
  const [otherServicesResponse, setOtherServicesResponse] = useState<Choice[]>(
    []
  );

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFormSubmitted, setIsFormSubmitted] = useState<boolean>(false);
  const [isMainServiceClicked, setIsMainServiceClicked] =
    useState<boolean>(false);
  const [isOtherServicesClicked, setIsOtherServicesClicked] =
    useState<boolean>(false);

  const handleMainServiceSubmit = async () => {
    setIsLoading(true);
    try {
      const choices = await fetchChatGptResponse(mainService);
      //console.log("Choices from API:", choices);
      setMainServiceResponse(choices);
      //console.log("Updated mainServiceResponse:", mainServiceResponse);
      setMainService("");
    } catch (error) {
      console.error("Erro ao buscar resposta:", error);
    }
    setIsLoading(false);

  };

  const handleOtherServicesSubmit = async () => {
    setIsLoading(true);
    try {
      const choices = await fetchChatGptResponse(otherServices);
      setOtherServicesResponse(choices);
    } catch (error) {
      console.error("Erro ao buscar resposta:", error);
    }
    setIsLoading(false);
  };

  const handleTagClick = (choice: Choice) => {
    if (otherServicesTags.length < 5) {
      setOtherServicesTags([...otherServicesTags, choice.message.content]);
      setIsOtherServicesClicked(true);
      setOtherServicesResponse((prevChoices) =>
        prevChoices.filter((item) => item.index !== choice.index)
      );
      setOtherServices("");
    } else {
      alert("Você só pode adicionar até 5 tags.");
    }
  };

  const handleSubmit = async () => {
    setIsFormSubmitted(true);

    if (!isMainServiceClicked || !isOtherServicesClicked) {
      alert("Por favor, clique nas sugestões antes de prosseguir.");
      return;
    }

    try {
      const collectedData: any = {
        userName,
        otherServices: otherServicesTags,
      };
      
      const mainServiceChoices = await fetchChatGptResponse(mainService);
      setMainServiceResponse(mainServiceChoices);
      collectedData.mainService = mainServiceChoices.map(
        (choice) => choice.message.content
      );

      const response = await fetch("/api/save-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userName,
          mainService,
          otherServicesTags
        }),
      });
  
      if (response.ok) {
        alert('Dados cadastrados com sucesso!');
      } else {
        alert('Erro ao salvar os dados.');
      }

      console.log("Dados a serem enviados:", {
        userName,
        mainService,
        otherServicesTags
      });
      

    } catch (error) {
      console.error("Erro ao salvar no MongoDB:", error);
    }

    //console.log("Debug mainServiceResponse:", mainServiceResponse); 
  };

  return (
    <main className={styles.main}>
      <div className={styles.card}>
        <Form
          isLoading={false}
          setValue={setUserName}
          value={userName}
          onSubmit={() => {}}
          placeholderText="Seu nome"
        />

        <Form
          isLoading={isLoading}
          setValue={setMainService}
          value={mainService}
          onSubmit={handleMainServiceSubmit}
          placeholderText="Serviço Principal"
          showButton
        />

        {!isFormSubmitted &&
          mainServiceResponse.map((choice: Choice) => {
            return (
              <p
                className={styles.response}
                key={choice.index}
                onClick={() => {
                  setMainService(choice.message.content); 
                  setIsMainServiceClicked(true);
                  setMainServiceResponse((prevChoices) =>
                    prevChoices.filter((item) => item.index !== choice.index)
                  );
                }}
              >
                você quis dizer? <strong>{choice.message.content}</strong>
              </p>
            );
          })}

        <Form
          isLoading={isLoading}
          setValue={setOtherServices}
          value={otherServices}
          onSubmit={handleOtherServicesSubmit}
          placeholderText="Outros Serviços"
          showButton
        />

        {!isFormSubmitted &&
          otherServicesResponse.map((choice: Choice) => {
            return (
              <p
                className={styles.response}
                key={choice.index}
                onClick={() => handleTagClick(choice)}
              >
                você quis dizer? <strong>{choice.message.content}</strong>
              </p>
              
            );
          })}

        <div>
          {otherServicesTags.map((tag, index) => (
            <span key={index} className={styles.tag}>
              {tag}
              <button
                onClick={() => {
                  setOtherServicesTags((prevTags) =>
                    prevTags.filter((_, i) => i !== index)
                  );
                }}
              >
                x
              </button>
            </span>
          ))}
        </div>

        <button className={styles.submitButton} onClick={handleSubmit}>
          Cadastrar
        </button>
      </div>
    </main>
  );
};

export default Register;
