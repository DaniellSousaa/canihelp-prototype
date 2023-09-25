const { MongoClient } = require("mongodb");

const uri = "mongodb+srv://canihelp:2Soi9MvhQLEHmYrq@cluster0.3uqqr.mongodb.net/canihelp";
const options = {};

async function saveRegisteredCategories() {
  const client = new MongoClient(uri, options);

  try {
      await client.connect();
      console.log("Conectado ao MongoDB");

      const db = client.db("canihelp_prototype");
      const usersCollection = db.collection("users");

      const users = await usersCollection.find({}).toArray();

      let categoryCount = {};

      users.forEach(user => {
          if (user.mainService) {
              categoryCount[user.mainService] = (categoryCount[user.mainService] || 0) + 1;
          }

          if (user.otherServices && Array.isArray(user.otherServices)) {
              user.otherServices.forEach(service => {
                  categoryCount[service] = (categoryCount[service] || 0) + 1;
              });
          }
      });

      const categoriesToInsert = Object.entries(categoryCount).map(([name, count]) => ({
          Name: name,
          Registers: count
      }));

      const categoriesCollection = db.collection("categories");
      await categoriesCollection.insertMany(categoriesToInsert);

      console.log(`Inseridas ${categoriesToInsert.length} categorias`);
  } catch (error) {
      console.error("Erro ao processar e inserir categorias:", error);
  } finally {
      client.close();
  }
}

saveRegisteredCategories();

async function clearCategoriesCollection() {
  const client = new MongoClient(uri, options);

  try {
    await client.connect();
    console.log("Conectado ao MongoDB");

    const db = client.db("canihelp_prototype");
    const usersCollection = db.collection("categories");

    const result = await usersCollection.deleteMany({});
    console.log(`Removidos ${result.deletedCount} documentos`);
  } catch (error) {
    console.error("Erro ao conectar e limpar a coleção:", error);
  } finally {
    client.close();
  }
}


//clearCategoriesCollection()