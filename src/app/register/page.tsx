"use client";

import React, { useEffect, useState } from "react";

import styles from "../page.module.css";
import { Form } from "../components/Form";
import { getChatGptList } from "@/utils/api";
import Carousel from "../components/Carousel";
import Checkbox from "../components/Checkbox";
import { searchMatchCategories, createIdFromName } from "@/utils/search";


const Register: React.FC = () => {
  const [userName, setUserName] = useState<string>("");
  const [mainService, setMainService] = useState<string>("");
  const [otherServicesTags, setOtherServicesTags] = useState<string[]>([]);

  const [categories, setCategories] = useState<string[]>([])

  const [mainServiceList, setMainServiceList] = useState<string[]>([]);
  const [otherServicesList, setOtherServicesList] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFormSubmitted, setIsFormSubmitted] = useState<boolean>(false);
  const [activeSlide, setActiveSlide] = useState(0);

 

  async function getCategories(){
    try {
      const response = await fetch('/api/categories',{
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      })
      if(!response.ok){
        throw new Error(`Api erro: ${response.statusText}`)
      }
      const data = await response.json();

      setCategories(data)
      
    } catch (error) {
      console.log('erro ao bucas categorias', error)
    }
  }


  const handleMainServiceSubmit = async (prompt: string) => {
    setIsLoading(true);
    try {
      const list = await getChatGptList(prompt);
      
      let listCategoriesAndReplyChatGpt = [...list]
      console.log('apenas chatGpt', listCategoriesAndReplyChatGpt)

      if(categories.length> 0){
        listCategoriesAndReplyChatGpt= [...new Set([...list, ...categories])]
      }

      console.log('chatGpt e categorias', listCategoriesAndReplyChatGpt)

      const matchedCategories = searchMatchCategories(prompt, listCategoriesAndReplyChatGpt);
      const highMatchCategories = matchedCategories.filter(item => item.Percent >= 80);
      const filteredList = highMatchCategories.map(item => item.Name)

      setMainServiceList(filteredList);
      //setMainService("");
    } catch (error) {
      console.error("Erro ao buscar resposta:", error);
    }
    setIsLoading(false);
  };

  const handleOptionClick = (selectedOption: string) => {
    setMainService(selectedOption);
    const filteredList: any = mainServiceList.filter(
      (item) => item !== selectedOption
    );
    setOtherServicesList(filteredList);
  };

  const handleCheckboxChange = (category: any, isChecked: any) => {
    if (isChecked) {
      if (otherServicesTags.length < 5) {
        setOtherServicesTags([...otherServicesTags, category]);
      } else {
        alert("Você só pode adicionar até 5 categorias.");
      }
    } else {
      setOtherServicesTags((prevTags) =>
        prevTags.filter((tag) => tag !== category)
      );
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


      const newCategories = [mainService, ...otherServicesList].filter(category => Array.isArray(categories) && !categories.includes(category))

      const categoryCount: {[key: string]: number}= {}
      
      newCategories.forEach((category) =>{
        categoryCount[category] = (categoryCount[category] || 0) + 1;
      })

      const categoriesToInsert = Object.entries(categoryCount).map(([name, count]) => ({
        _id: createIdFromName(name),
        Name: name,
        Registers: count
    }));

      const response = await fetch("/api/save-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({...collectedData, newCategories: categoriesToInsert}),
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

  let isNextButtonDisabled = false;
  if (activeSlide === 0) {
    isNextButtonDisabled = !userName;
  } else if (activeSlide === 1) {
    isNextButtonDisabled = !mainService;
  }

  useEffect(()=> {
    getCategories()
  }, [])

  return (
    <main className={styles.main}>
      <nav className={styles.menu}>
        <a href="/">Início</a>
        <a href="/register">Cadastro</a>
      </nav>

      <h2 className={styles.title}>Cadastro</h2>
      <div className={styles.card}>
        <Carousel
          handleSubmit={handleSubmit}
          isDisabled={isNextButtonDisabled}
          onSlideChange={setActiveSlide}
        >
          <div>
            <Form
              isLoading={false}
              setValue={setUserName}
              value={userName}
              onSubmit={() => {}}
              placeholderText="Seu nome"
            />
          </div>

          <div>
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
                mainServiceList.map((c, i) => (
                  <li
                    className={styles.listItem}
                    key={i}
                    onClick={() => {
                      handleOptionClick(c);
                    }}
                  >
                    {c}
                  </li>
                ))}
            </ul>
          </div>

          <ul className={styles.list}>
            {otherServicesList.map((category, i) => (
              <li key={i} className={styles.listItem}>
                <Checkbox
                  label={category}
                  checked={otherServicesTags.includes(category)}
                  onChange={(isChecked) =>
                    handleCheckboxChange(category, isChecked)
                  }
                />
              </li>
            ))}
          </ul>
        </Carousel>
      </div>
    </main>
  );
};

export default Register;
