const { MongoClient } = require('mongodb');


const uri = "mongodb+srv://canihelp:2Soi9MvhQLEHmYrq@cluster0.3uqqr.mongodb.net/canihelp"
const options = {};

async function seedDatabase() {
  const client = new MongoClient(uri, options);

  try {
    await client.connect();
    console.log('Conectado ao MongoDB');

    //Banco:canihelp
    const db = client.db('canihelp');
    const categoriesCollection = db.collection('categories');

    //função find para obter todas as categorias
    const categories = await categoriesCollection.find({}, { projection: { Name: 1 } }).toArray();
    const categoryNames = categories.map(category => category.Name);
    //console.log('Todas as categorias:', categoryNames);

    //Banco:canihelp_prototype
    const dbForUsers = client.db('canihelp_prototype'); 
    const usersCollection = dbForUsers.collection('users');

    const usersToInsert = [];

    for(let i= 0; i < 300; i++){
      const userName = `User-Teste_${Math.floor(Math.random() * 10000)}`
      const mainService = categoryNames[Math.floor(Math.random() * categoryNames.length)];
      const serviceCount = Math.floor(Math.random()* 5) + 1

      const otherServices = [];

      for(let j = 0; j < serviceCount; j++){
        const randomlySelectedService = categoryNames[Math.floor(Math.random() * categoryNames.length)];
        otherServices.push(randomlySelectedService)
      }

      usersToInsert.push({
        userName,
        mainService,
        otherServices
      })
    }

    const result = await usersCollection.insertMany(usersToInsert)
    console.log(`Inseridos ${result.insertedCount} usuários`);

  } catch (error) {
    console.error('Erro ao conectar e obter categorias:', error);
  } finally {
    client.close();
  }
}

seedDatabase();



//Teste
async function clearUsersCollection() {
  const client = new MongoClient(uri, options);

  try {
    await client.connect();
    console.log('Conectado ao MongoDB');

    const db = client.db('canihelp_prototype');
    const usersCollection = db.collection('users');

    const result = await usersCollection.deleteMany({}); 
    console.log(`Removidos ${result.deletedCount} documentos`);

  } catch (error) {
    console.error('Erro ao conectar e limpar a coleção:', error);
  } finally {
    client.close();
  }
}

//clearUsersCollection();
