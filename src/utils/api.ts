export const getChatGptList = async (prompt: string): Promise<string[]> => {
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
    throw { message: "Falha na requisição à API" };
  }

  const result = await response.json();

  if (!result?.choices?.length) {
    throw { message: "Nenhum resultado encontrado. Tente novamente." };
  }

  const listSplit = result.choices[0].message.content.split("1. ");

  if (listSplit.length > 1) {
    const categoriesArr = listSplit[1].split(". ").map((c: string) => {
      const dotsPos = c.indexOf(":");
      if (dotsPos > -1) return c.slice(0, dotsPos);

      const breakLinePos = c.indexOf("\n");
      if (breakLinePos > -1) return c.slice(0, breakLinePos);

      const parenthesisPos = c.indexOf("(");
      if (parenthesisPos > -1) return c.slice(0, parenthesisPos);

      return c;
    });

    return categoriesArr;
  } else {
    throw { message: result.choices[0].message.content };
  }
};
