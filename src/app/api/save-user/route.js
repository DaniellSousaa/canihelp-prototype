import { NextResponse } from "next/server";
import {createIdFromName } from "@/utils/search";

import clientPromise from "../../lib/mongodb";

export async function POST(req, res) {
  // Verificar o método da requisição
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método não permitido" });
  }

  // Conectar ao MongoDB
  const client = await clientPromise;
  const db = client.db("canihelp_prototype");

  const { userName, mainService, otherServices } = await req.json();

  try {
    
    const allServices = [mainService, ...otherServices];
    console.log('Todas as caterogiras =>', allServices)

    // Verificar quais categorias já existem
    const existingCategories = await db.collection("categories").find({ Name: { $in: allServices } }).toArray();
    const existingCategoryNames = existingCategories.map(cat => cat.Name);

    // Determinar quais categorias precisam ser inseridas
    const categoriesToInsert = allServices.filter(service => !existingCategoryNames.includes(service));
    console.log('Caterogiras não cadastradas =>', categoriesToInsert)

    // Inserir as categorias não cadastradas
    if (categoriesToInsert.length > 0) {
      const documentsToInsert = categoriesToInsert.map(category => ({
        _id: createIdFromName(category), // Certifique-se de que esta função está definida e disponível neste arquivo
        Name: category,
        Registers: 1 // Inicializando o contador de registros para novas categorias
      }));
      await db.collection("categories").insertMany(documentsToInsert);
    }

    // Atualizar o contador de registros para categorias existentes
    for (const existingCategory of existingCategories) {
      await db.collection("categories").updateOne(
        { _id: existingCategory._id },
        { $inc: { Registers: 1 } }
      );
    }

    // Inserir os dados no MongoDB
    await db.collection("users").insertOne({
      userName,
      mainService,
      otherServices,
    });

    return NextResponse.json({ message: "Dados cadastrados com sucesso!" }, { status: 201 });
  } catch (error) {
    // Imprimir qualquer erro do MongoDB
    console.error("MongoDB Error:", error);
    return NextResponse.json({ message: "Erro ao salvar no MongoDB", error: error.message }, { status: 500 });
  }
}
