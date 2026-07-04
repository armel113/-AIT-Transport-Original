"use strict";
// Script de migration — hashe les mots de passe en clair existants
// Exécuter une seule fois : node migrate_passwords.js

require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function main() {
  console.log("Migration des mots de passe en cours...");
  const users = await prisma.utilisateurs.findMany();
  let count = 0;

  for (const u of users) {
    // Si pas encore hashé (bcrypt commence par $2)
    if (!u.password.startsWith("$2")) {
      const hashed = await bcrypt.hash(u.password, 10);
      await prisma.utilisateurs.update({
        where: { login: u.login },
        data:  { password: hashed },
      });
      console.log(`  OK : ${u.login} — mot de passe hashé`);
      count++;
    } else {
      console.log(`  SKIP : ${u.login} — déjà hashé`);
    }
  }

  console.log(`\nMigration terminée — ${count} mot(s) de passe hashé(s).`);
  console.log("IMPORTANT : Notez bien vos mots de passe — ils ne peuvent plus être lus en clair.");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
