import { faker } from "@faker-js/faker"
import fs from "fs"
import path from "path"

const users = Array.from({ length: 100 }, () => ({
  id: BigInt(faker.number.int({ min: 1000000000, max: 9999999999 })), // Génération d'un ID en tant que BigInt
  created_at: faker.date.past(),
  id_client: faker.string.uuid(),
  prenom: faker.person.firstName(),
  nom: faker.person.lastName(),
  Tel: faker.phone.number(),
  Pays: faker.location.country(),
  is_gp: faker.datatype.boolean(),
  fcm_token: faker.string.uuid(),
  ville: faker.location.city(),
  img_url: faker.image.url(), // URL d'une image générée
}))

try {
  fs.writeFileSync(
    path.join(__dirname, "users.json"),
    JSON.stringify(users, null, 2)
  )
  console.log("✅ Users data generated.")
} catch (error) {
  console.error("❌ Error writing file:", error);
}
