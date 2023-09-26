"use client";

import React, { useEffect, useState } from "react";

import styles from "./page.module.css";
import { Form } from "./components/Form";
import { getChatGptList } from "@/utils/api";
import { searchMatchCategories } from "@/utils/search";

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

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);


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


  //teste
  async function fetchAllCategories() {
    try {
      const response = await fetch('/api/categories', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erro na resposta da API');
      }

      const data = await response.json();
      setCategories(data.data); 
      setLoading(false);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      setError(error);
      setLoading(false);
    }
  }

  async function getFilteredCategories(searchTerm) {
    return searchMatchCategories(searchTerm, categories).slice(0, 5); 
  }

  useEffect(() => {
    fetchAllCategories();
  }, []);
  
  useEffect(() => {
    getFilteredCategories("porteiro").then(filteredResults => {
      console.log(filteredResults);
    });
  }, [categories]); 
  
  

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
