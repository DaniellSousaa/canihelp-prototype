"use client";

import React, { useState } from "react";

import styles from "./page.module.css";
import { Form } from "./components/Form";
import { getChatGptList } from "@/utils/api";

interface IUser {
  userName: string;
  mainService: string;
  otherServices: string[];
}

const Home: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [search, setSearch] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<IUser[]>([]);

  const onSubmit = async (term: string) => {
    setIsLoading(true);
    setError(null);

    try {
      setSearch(term);

      const response = await fetch(`/api/users?term=${term}`, {
        method: "GET",
      });

      const res = await response.json();

      setUsers(res.data);
    } catch (err: any) {
      setError(err?.message || "Ocorreu um erro");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className={styles.main}>
      <nav className={styles.menu}>
        <a href="/">Início</a>
        <a href="/register">Cadastro</a>
      </nav>

      <h2 className={styles.title}>Início</h2>
      <div className={styles.card}>
        <Form
          isLoading={isLoading}
          onSubmit={onSubmit}
          placeholderText="Qual serviço você deseja pesquisar?"
          showButton
        />

        {!!search && (
          <div>
            <h3 className={styles.results}>
              Resultados para: <i>{search}</i>
            </h3>

            <ul className={styles.users}>
              {users.map((u, i) => (
                <li key={i}>
                  <p className={styles.name}>{u.userName}</p>
                  <p className={styles.category}>{u.mainService}</p>
                  <div className={styles.categoryTags}>
                    {u.otherServices.map((s, j) => (
                      <p key={j}>{s}</p>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {!!error && (
          <p className={styles.response}>
            <strong>{error}</strong>
          </p>
        )}
      </div>
    </main>
  );
};

export default Home;
