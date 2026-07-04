"use strict";
require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

// Configuration de l'agence
const AGENCE_ID  = process.env.AGENCE_ID  || "soubre";
const AGENCE_NOM = process.env.AGENCE_NOM || "AIT Transport Soubre";
const AGENCE_VILLE = process.env.AGENCE_VILLE || "Soubre";

async function main() {
  console.log(`Injection donnees : ${AGENCE_NOM}...`);

  // Agence principale
  await prisma.agences.upsert({
    where:  { id: AGENCE_ID },
    update: { nom: AGENCE_NOM, ville: AGENCE_VILLE },
    create: { id: AGENCE_ID, nom: AGENCE_NOM, ville: AGENCE_VILLE, is_active: true },
  });

  // Comptes utilisateurs
  const users = [
    { login:"admin",    password:"admin2026",   role:"gestionnaire", full_name:"Administrateur" },
    { login:"manager",  password:"1234",         role:"gestionnaire", full_name:"Gestionnaire" },
    { login:"Vendeur1", password:"1111",         role:"vendeur",      full_name:"Vendeur 1" },
    { login:"Vendeur2", password:"2222",         role:"vendeur",      full_name:"Vendeur 2" },
  ];

  for (const u of users) {
    const hashed = await bcrypt.hash(u.password, 10);
    await prisma.utilisateurs.upsert({
      where:  { login: u.login },
      update: { password: hashed, role: u.role, full_name: u.full_name },
      create: { login: u.login, password: hashed, role: u.role,
                agence_id: AGENCE_ID, full_name: u.full_name, is_active: true },
    });
    console.log(`  OK : ${u.login}`);
  }

  // Chauffeurs
  await prisma.chauffeurs.createMany({ skipDuplicates: true, data: [
    { id:"C1", nom:"Chauffeur 1", bus_id:"C1" },
    { id:"C2", nom:"Chauffeur 2", bus_id:"C2" },
    { id:"C3", nom:"Chauffeur 3", bus_id:"C3" },
    { id:"C4", nom:"Chauffeur 4", bus_id:"C4" },
  ]});

  console.log(`\nOK : ${AGENCE_NOM} configure !`);
  console.log("\nComptes :");
  console.log("  admin    / admin2026 -> gestionnaire");
  console.log("  manager  / 1234      -> gestionnaire");
  console.log("  Vendeur1 / 1111      -> vendeur");
  console.log("  Vendeur2 / 2222      -> vendeur");
}

main().catch(e => { console.error(e); process.exit(1); })
      .finally(() => prisma.$disconnect());
