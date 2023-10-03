const { MongoClient } = require("mongodb");

const uri = "mongodb+srv://canihelp:2Soi9MvhQLEHmYrq@cluster0.3uqqr.mongodb.net/canihelp";
const options = {};


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
          _id: createIdFromName(name),
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