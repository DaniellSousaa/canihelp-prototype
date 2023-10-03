import { NextResponse } from "next/server";

import clientPromise from "../../lib/mongodb";

export async function GET(req, res) {
  // Verificar o método da requisição
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Método não permitido" });
  }

  //Teste
  const termFromURL = req.url.split("users?")[1].split("=")[1];

  console.log(termFromURL);

  const term = termFromURL.split(",").map((term) => term.replace(/-/g, " "));

  console.log(term);

  if (!term) {
    throw { message: "Termo obrigatório" };
  }

  // Conectar ao MongoDB
  const client = await clientPromise;
  const db = client.db("canihelp_prototype");

  try {
    // Inserir os dados no MongoDB
    const users = await db
      .collection("users")
      .aggregate([
        {
          $search: {
            index: "users_search",
            text: {
              query: term,
              path: ["mainService", "otherServices"],
            },
          },
        },
      ])
      .toArray();

    return NextResponse.json({ data: users }, { status: 201 });
  } catch (error) {
    console.error("Search Error:", error);
    return NextResponse.json(
      { message: "Erro ao pesquisar", error: error.message },
      { status: 500 }
    );
  }
}
