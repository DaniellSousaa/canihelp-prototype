const { MongoClient } = require("mongodb");

const uri = "";
const options = {};

async function saveRegisteredCategories() {
  const client = new MongoClient(uri, options);

  try {
    await client.connect();

    const db = client.db("canihelp_prototypes");

    const usersCollection = db.collection("users");
  } catch (err) {
  } finally {
  }
}

saveRegisteredCategories();
