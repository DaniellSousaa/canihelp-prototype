import { NextResponse } from "next/server";
import clientPromise from "../../lib/mongodb";

const replaceSpecialChars = (value) => {
  if (!value) return value;

  let str = value?.toString();
  str = str?.replace(/[ÀÁÃÄÂ]/g, "A");
  str = str?.replace(/[àáãâä]/g, "a");
  str = str?.replace(/[ÈÉÊË]/g, "E");
  str = str?.replace(/[èéêë]/g, "e");
  str = str?.replace(/[ÌÍÎÏ]/g, "I");
  str = str?.replace(/[ìíîï]/g, "i");
  str = str?.replace(/[ÒÓÔÕÖ]/g, "O");
  str = str?.replace(/[òóôõö]/g, "o");
  str = str?.replace(/[ÙÚÛŨÜ]/g, "U");
  str = str?.replace(/[ùúûũü]/g, "u");
  str = str?.replace(/[Ç]/g, "C");
  str = str?.replace(/[ç]/g, "c");

  return str;
};

const createIdFromName = (name) => {
  if (!name) return name;

  let id = name.toLowerCase(); 
  id = replaceSpecialChars(id); 
  id = id.replace(/\s+/g, '_');

  return id;
};

export async function POST(req, res) {
  // Verificar o método da requisição
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método não permitido" });
  }

  // Conectar ao MongoDB
  const client = await clientPromise;
  const db = client.db("canihelp_prototype");

  const { categories } = await req.json();

  try {
    // Verificar quais categorias já existem
    const existingCategories = await db.collection("categories").find({ Name: { $in: categories } }).toArray();
    const existingCategoryNames = existingCategories.map(cat => cat.Name);

    // Determinar quais categorias precisam ser inseridas
    const categoriesToInsert = categories.filter(category => !existingCategoryNames.includes(category));

    // Inserir as categorias não cadastradas
    if (categoriesToInsert.length > 0) {
      const documentsToInsert = categoriesToInsert.map(category => ({
        _id: createIdFromName(category),
        Name: category
      }));
      await db.collection("categories").insertMany(documentsToInsert);
    }

    return NextResponse.json({ message: "Categorias processadas com sucesso!" }, { status: 201 });
  } catch (error) {
    // Imprimir qualquer erro do MongoDB
    console.error("MongoDB Error:", error);
    return NextResponse.json({ message: "Erro ao salvar no MongoDB", error: error.message }, { status: 500 });
  }
}
