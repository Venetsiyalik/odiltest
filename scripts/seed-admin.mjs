// Bir martalik/qayta ishlatiladigan skript: Supabase Auth'da foydalanuvchi
// yaratadi va `foydalanuvchilar` jadvaliga profil yozadi (admin yoki
// o'qituvchi). service_role kaliti kerak, shuning uchun faqat lokalda,
// .env.local orqali ishga tushiriladi.
//
// Foydalanish:
//   node scripts/seed-admin.mjs <email> <parol> ["Ism Familiya"] [admin|oqituvchi]

import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";

function envLocalniYuklash() {
  const faylYoli = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(faylYoli)) return;
  const kontent = fs.readFileSync(faylYoli, "utf8");
  for (const qator of kontent.split("\n")) {
    const trimmed = qator.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const kalit = trimmed.slice(0, idx).trim();
    const qiymat = trimmed.slice(idx + 1).trim();
    if (!(kalit in process.env)) process.env[kalit] = qiymat;
  }
}

envLocalniYuklash();

const [, , email, parol, ismFamiliya = email, rol = "admin"] = process.argv;

if (!email || !parol) {
  console.error(
    'Foydalanish: node scripts/seed-admin.mjs <email> <parol> ["Ism Familiya"] [admin|oqituvchi]',
  );
  process.exit(1);
}

if (rol !== "admin" && rol !== "oqituvchi") {
  console.error('rol faqat "admin" yoki "oqituvchi" bo\'lishi mumkin');
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.error(
    "NEXT_PUBLIC_SUPABASE_URL yoki SUPABASE_SERVICE_ROLE_KEY .env.local'da topilmadi",
  );
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: userData, error: userError } = await supabase.auth.admin.createUser({
  email,
  password: parol,
  email_confirm: true,
});

if (userError) {
  console.error("Auth foydalanuvchi yaratishda xato:", userError.message);
  process.exit(1);
}

const { error: profilError } = await supabase.from("foydalanuvchilar").insert({
  id: userData.user.id,
  ism_familiya: ismFamiliya,
  rol,
});

if (profilError) {
  console.error("Profil yozishda xato:", profilError.message);
  process.exit(1);
}

console.log(`Yaratildi: ${email} — rol: ${rol}`);
