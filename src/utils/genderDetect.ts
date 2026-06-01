// Heurística mejorada para contar géneros a partir de nombres (fallback local).
// Acepta un array de nombres (strings) o objetos con { nombre } y devuelve { hombres, mujeres }.
// Estrategia:
// 1) Normaliza el nombre (sin acentos, minúsculas).
// 2) Intenta coincidencias exactas contra listas grandes de nombres comunes.
// 3) Quita títulos/honoríficos y vuelve a intentar.
// 4) Usa heurísticas de sufijo (-a femenino, -o masculino), con excepciones para nombres neutros.
// 5) Si sigue ambiguo, no cuenta (conservador) o cuenta como hombre si no hay pistas — esto puede ajustarse.

const FEMALE_NAMES = new Set([
  'maria','ana','sofia','valeria','camila','laura','mariana','elena','sandra','marta','karla','karen','paola','auxiliadora','lucia','isabel','gabriela','monica','marcela','silvia','juliana','patricia','andrea','rosa','veronica','cristina','beatriz','claudia','adriana','susana','teresita','yolanda','natalia','noelia','graciela','karina','pamela','lorena','nuria','catalina','soledad','isabela'
]);

const MALE_NAMES = new Set([
  'juan','jose','josé','carlos','diego','luis','mateo','javier','antonio','ricardo','miguel','andres','andrés','fernando','roberto','pedro','alberto','manuel','santiago','eduardo','raul','jorge','pablo','sergio','david','alejandro','oscar','felipe','martin','ismael','marco','ramiro'
]);

const HONORIFICS = /^(ms|mr|mrs|sr|sra|sra\.|sr\.|dr|dr\.|lic|lic\.|prof|prof\.)\s*/i;

function normalizeName(s: string) {
  return s
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z\s]/g, '')
    .replace(HONORIFICS, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function countGenders(items: Array<string | { nombre?: string } | null | undefined> = []) {
  let hombres = 0;
  let mujeres = 0;

  for (const raw of items) {
    if (!raw) continue;
    const name = typeof raw === 'string' ? raw : raw.nombre ?? '';
    if (!name) continue;

    const n = normalizeName(name);
    if (!n) continue;

    const tokens = n.split(/\s+/).filter(Boolean);
    if (!tokens.length) continue;

    // Revisar token por token (primero, segundo, etc.) buscando coincidencias exactas en las listas
    let decided = false;
    for (let i = 0; i < Math.min(tokens.length, 3); i++) {
      const t = tokens[i];
      if (FEMALE_NAMES.has(t)) { mujeres += 1; decided = true; break; }
      if (MALE_NAMES.has(t)) { hombres += 1; decided = true; break; }
    }
    if (decided) continue;

    // Heurísticas de sufijo — con una lista pequeña de excepciones neutras
    const neutral = new Set(['mar','angel','alex','pat']); // nombres ambivalentes comunes
    const first = tokens[0];
    if (!neutral.has(first)) {
      if (first.endsWith('a') && first.length > 2) { mujeres += 1; continue; }
      if (first.endsWith('o') && first.length > 2) { hombres += 1; continue; }
    }

    // Buscar en cualquier token una terminación fuerte
    if (tokens.some((t) => t.endsWith('a') && t.length > 2)) { mujeres += 1; continue; }
    if (tokens.some((t) => t.endsWith('o') && t.length > 2)) { hombres += 1; continue; }

    // Si ninguno de los heurísticos dio resultado, considerar segundo token (por si hay títulos)
    if (tokens.length > 1) {
      const second = tokens[1];
      if (FEMALE_NAMES.has(second)) { mujeres += 1; continue; }
      if (MALE_NAMES.has(second)) { hombres += 1; continue; }
    }

    // Fallback conservador: si no hay pistas, no contar para evitar sesgos.
    // Pero para compatibilidad con la UI que espera números, contaremos como hombre sólo si no hay más pistas.
    hombres += 1;
  }

  return { hombres, mujeres };
}

export default countGenders;
