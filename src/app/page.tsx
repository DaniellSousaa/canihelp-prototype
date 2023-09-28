"use client";

import React, { useEffect, useState } from "react";

import styles from "./page.module.css";
import { Form } from "./components/Form";
import { replaceSpecialChars, searchMatchCategories } from "@/utils/search";

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
  const [filteredCategories, setFilteredCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);


  const onSubmit = async (term: string, isCategoryClick?: boolean) => {
    setIsLoading(true);
    setError(null);

    let searchTerm;

    if (isCategoryClick) {
        searchTerm = term;
    } else {
        const results = searchMatchCategories(term, categories);
        const exactMatch = results.find(result => result.Equal);
        if (exactMatch) {
            searchTerm = exactMatch.Name;
        } else if (results.length > 0) {
            searchTerm = results.slice(0,3).map(r => r.Name).join(" ");
        } else {
            searchTerm = term;
        }
    }

   
    setSearch(searchTerm);
    setFilteredCategories([]);

    searchTerm = replaceSpecialChars(searchTerm);

    searchTerm = searchTerm.split(" ").join(",");

    try {
        const response = await fetch(`/api/users?term=${searchTerm}`, {
            method: "GET",
        });

        const res = await response.json();
        const searchTermArray = searchTerm.split(" "); 

        const filteredUsers = res.data.filter((user: IUser) => {
            return searchTermArray.some(searchTermItem => 
                user.mainService.toLowerCase().includes(searchTermItem.toLowerCase()) ||
                user.otherServices.some(service => service.toLowerCase().includes(searchTermItem.toLowerCase()))
            );
        });

        setUsers(filteredUsers);
    } catch (err: any) {
        setError(err?.message || "Ocorreu um erro");
    } finally {
        setIsLoading(false);
    } 
  };

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

  const handleFilterCategories = (term: string) => {
    if (term.length >= 2) {
        const results = searchMatchCategories(term, categories);
        const categoryNames = results.map(result => result.Name).slice(0, 5);
        setFilteredCategories(categoryNames);
    } else {
        setFilteredCategories([]);
        setUsers([]);
        setSearch(null)
    }
  };

 const handleCategoryClick = (category: string) => {
    console.log("handleCategoryClick called with category:", category);
    setSearch(category);
    setFilteredCategories([]);
    onSubmit(category, true);
  };


  useEffect(() => {
    fetchAllCategories();
  }, []);

  //const categoriesString = categories.join(' ');


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
        value={search}
        onSubmit={onSubmit}
        placeholderText="Qual serviço você deseja pesquisar?"
        showButton
        onChange={handleFilterCategories}
      />

        <ul className={styles.list}>
            {filteredCategories.map((category, i) => (
                <li
                    className={styles.listItem}
                    key={i}
                    onClick={() => handleCategoryClick(category)}
                >
                    {category}
                </li>
            ))}
        </ul>


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
                    {u.otherServices
                      .filter(service => service.toLowerCase().includes(search?.toLowerCase() || ''))
                      .map((s, j) => (
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
