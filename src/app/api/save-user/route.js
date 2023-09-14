import { NextResponse } from "next/server";

import clientPromise from "../../lib/mongodb";

export async function POST(req, res) {
  // Verificar o método da requisição
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método não permitido" });
  }

  // Conectar ao MongoDB
  const client = await clientPromise;
  const db = client.db("canihelp_prototype");

  // Desestruturar o corpo da requisição
  const { userName, mainService, otherServices } = await req.json();

  try {
    // Inserir os dados no MongoDB
    await db.collection("users").insertOne({
      userName,
      mainService,
      otherServices,
    });

    res.status(201).json({ message: "Dados cadastrados com sucesso!" });
  } catch (error) {
    // Imprimir qualquer erro do MongoDB
    console.error("MongoDB Error:", error);
    res
      .status(500)
      .json({ message: "Erro ao salvar no MongoDB", error: error.message });
  }
}
