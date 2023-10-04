import { NextResponse } from "next/server";
import clientPromise from "../../lib/mongodb";

const splitTerms = (input) => {
  return input.split(" ")
    .reduce((acc, word) => {
      if (word.charAt(0).toUpperCase() === word.charAt(0) && acc.length > 0) {
        acc.push(word);
      } else if (acc.length > 0) {
        acc[acc.length - 1] = `${acc[acc.length - 1]} ${word}`;
      } else {
        acc.push(word);
      }
      return acc;
    }, []);
};

export async function POST(req, res) {
  // Verificar o método da requisição
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método não permitido" });
  }

  // Extrair termo do corpo da requisição
  const { term } = await req.json();

  if (!term || (typeof term !== 'string' && !Array.isArray(term))) {
    throw { message: "Termo obrigatório e deve ser um array de strings" };
  }

  //console.log(term)
  const searchTerms = typeof term === 'string' ? splitTerms(term) : term;

  console.log(searchTerms)

  // Conectar ao MongoDB.
  const client = await clientPromise;
  const db = client.db("canihelp_prototype");

  try {
    // Inserir os dados no MongoDB
    const users = await db
    .collection("users")
    .find({
      $or: [
        { mainService: { $in: searchTerms } },
        { otherServices: { $in: searchTerms } }
      ]
    })
    .toArray();

    /*const users = await db
      .collection("users")
      .aggregate([
        {
          $search: {
            index: "users_search",
            text: {
              query: searchTerms,
              path: ["mainService", "otherServices"],
            },
          },
        },
      ])
    .toArray();*/

    return NextResponse.json({ data: users }, { status: 201 });
  } catch (error) {
    console.error("Search Error:", error);
    return NextResponse.json(
      { message: "Erro ao pesquisar", error: error.message },
      { status: 500 }
    );
  }
}
