"use client";

import React, { useState } from "react";

import styles from "../page.module.css";
import { Form } from "../components/Form";
import { getChatGptList } from "@/utils/api";

const Register: React.FC = () => {
  const [userName, setUserName] = useState<string>("");
  const [mainService, setMainService] = useState<string>("");
  const [otherServicesTags, setOtherServicesTags] = useState<string[]>([]);

  const [mainServiceList, setMainServiceList] = useState<string[]>([]);
  const [otherServicesList, setOtherServicesList] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFormSubmitted, setIsFormSubmitted] = useState<boolean>(false);

  const handleMainServiceSubmit = async (prompt: string) => {
    setIsLoading(true);
    try {
      const list = await getChatGptList(prompt);

      setMainServiceList(list);
      setMainService("");
    } catch (error) {
      console.error("Erro ao buscar resposta:", error);
    }
    setIsLoading(false);
  };

  const handleOtherServicesSubmit = async (prompt: string) => {
    setIsLoading(true);
    try {
      const list = await getChatGptList(prompt);

      setOtherServicesList(list);
    } catch (error) {
      console.error("Erro ao buscar resposta:", error);
    }
    setIsLoading(false);
  };

  const handleTagClick = (category: string) => {
    if (otherServicesTags.length < 5) {
      setOtherServicesTags([...otherServicesTags, category]);
      setOtherServicesList((prevChoices) =>
        prevChoices.filter((item) => item !== category)
      );
    } else {
      alert("Você só pode adicionar até 5 tags.");
    }
  };

  const handleSubmit = async () => {
    setIsFormSubmitted(true);

    if (!userName) {
      alert("Seu nome é obrigatório");
      return;
    }

    if (!mainService || !otherServicesTags.length) {
      alert("Por favor, clique nas sugestões antes de prosseguir.");
      return;
    }

    try {
      const collectedData: any = {
        userName,
        mainService,
        otherServices: otherServicesTags,
      };

      const response = await fetch("/api/save-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(collectedData),
      });

      if (response.ok) {
        alert("Dados cadastrados com sucesso!");
        window.location.reload();
      } else {
        alert("Erro ao salvar os dados.");
      }
    } catch (error) {
      console.error("Erro ao salvar no MongoDB:", error);
    }
  };

  return (
    <main className={styles.main}>
      <nav className={styles.menu}>
        <a href="/">Início</a>
        <a href="/register">Cadastro</a>
      </nav>

      <h2 className={styles.title}>Cadastro</h2>
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
          value={mainService}
          disabled={!!mainService}
          onSubmit={handleMainServiceSubmit}
          placeholderText="Serviço Principal"
          showButton
        />

        <ul className={styles.list}>
          {!isFormSubmitted &&
            mainServiceList.map((c, i) => {
              return (
                <li
                  className={styles.listItem}
                  key={i}
                  onClick={() => {
                    setMainService(c);
                    setMainServiceList([]);
                  }}
                >
                  {c}
                </li>
              );
            })}
        </ul>

        <Form
          isLoading={isLoading}
          onSubmit={handleOtherServicesSubmit}
          placeholderText="Outros Serviços"
          showButton
        />

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

        <ul className={styles.list}>
          {!isFormSubmitted &&
            otherServicesList.map((c, i) => {
              return (
                <li
                  className={styles.listItem}
                  key={i}
                  onClick={() => handleTagClick(c)}
                >
                  {c}
                </li>
              );
            })}
        </ul>

        <button className={styles.submitButton} onClick={handleSubmit}>
          Cadastrar
        </button>
      </div>
    </main>
  );
};

export default Register;
