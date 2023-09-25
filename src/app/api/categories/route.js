import { NextResponse } from "next/server";

import clientPromise from "../../lib/mongodb";

export async function GET(req, res) {
  // Verificar o método da requisição
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Método não permitido" });
  }

  // Conectar ao MongoDB
  const client = await clientPromise;
  const db = client.db("canihelp_prototype");

  try {
    const collection = await db
      .collection("categories")
      .find()
      .toArray();
    return NextResponse.json({ data: collection }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "Erro ao buscar gaterorias", error: error.message },
      { status: 500 }
    );
  }
}
