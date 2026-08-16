import { extractTextPagesFromPdf } from "@/core/lib/pdf/extractTextFromPdf";

export interface CanvasParsedGroup {
  name: string;
  weightPercent: number;
}

export interface CanvasParsedAssignment {
  name: string;
  groupName: string;
  score: number | null;
  maxPoints: number | null;
  isProfessionalism: boolean;
}

export type CanvasPdfParseResult =
  | {
      success: true;
      title: string;
      groups: CanvasParsedGroup[];
      assignments: CanvasParsedAssignment[];
      weightsWereDerived: boolean;
      hasAlignmentWarning: boolean;
    }
  | { success: false; error: "no_data_found" };

const PRINT_BUTTON_NOISE = [
  /Imprimir calificaciones\s*\(javascript:window\.print\(\)\)/gi,
  /Print grades\s*\(javascript:window\.print\(\)\)/gi,
  /Imprimir notas\s*\(javascript:window\.print\(\)\)/gi,
];

const PAGE_HEADER_END_MARKERS = [
  /Curso\s+Organizar por\s+Nombre\s+Fecha de\s+entrega\s+Entregado\s+Estado\s+Puntaje/i,
  /Nombre\s+Fecha de\s+entrega\s+Entregado\s+Estado\s+Puntaje/i,
  /Course\s+Sort by\s+Name\s+Due\s+Submitted\s+Status\s+Score/i,
  /Name\s+Due\s+Submitted\s+Status\s+Score/i,
  /Course\s+Organize by\s+Name\s+Delivery date\s+Delivered\s+State\s+Score/i,
  /Name\s+Delivery date\s+Delivered\s+State\s+Score/i,
  /Curso\s+Organizar por\s+Nome\s+Data de\s+entrega\s+Enviado\s+Status\s+Nota/i,
  /Nome\s+Data de\s+entrega\s+Enviado\s+Status\s+Nota/i,
  /Curso\s+Organizar por\s+Nome\s+Data de\s+entrega\s+Entregue\s+Estado\s+Pontuação/i,
  /Nome\s+Data de\s+entrega\s+Entregue\s+Estado\s+Pontuação/i,
];

const COURSE_DROPDOWN_NOISE = [
  /\[.*?\]\s*-\s*.+?\s+(?:Fecha de entrega|Due Date|Delivery date|Data de entrega|Sort by|Organizar por)\s+/gi,
];

const TAB_LABEL_NOISE = [
  /Tareas\s+Dominio del aprendizaje/gi,
  /Assignments\s+Learning Mastery/gi,
  /Tasks\s+Mastery of learning/gi,
  /Tarefas\s+Dom[ií]nio d[ea]\s+[Aa]prendizagem/gi,
];

const DATE_PATTERNS = [
  /\d{1,2}\s+de\s+[a-zà-ÿ]+,?\s+(?:a las|en)\s+\d{1,2}:\d{2}/gi,
  /[a-zà-ÿ]{3,9}\.?\s+\d{1,2}(?:,?\s*\d{4})?\s+at\s+\d{1,2}:\d{2}\s*(?:am|pm)?/gi,
  /\d{1,2}\s+de\s+[a-zà-ÿ]+,?\s+às\s+\d{1,2}[:h]\d{2}/gi,
  // Jala's machine-translated locales sometimes render dates as broken
  // word-for-word substitutions (e.g. "11 the one and 19:45" instead of a
  // real date, or "11 o um e 19:45" in Portuguese). Strip that shape too.
  /\d{1,2}\s+(?:the|o)\s+\S+\s+(?:and|e)\s+\d{1,2}:\d{2}/gi,
];

const WEIGHT_TABLE_MARKERS = [
  /Las tareas se ponderan por grupo/i,
  /Assignments are weighted by group/i,
  /As tarefas s[ãa]o ponderadas por grupo/i,
];

const GROUP_WORD = "[A-ZÀ-Ý]{2,}";
const GROUP_CONNECTOR = `(?:\\s*[&,\\-]|\\s+${GROUP_WORD})`;
const GROUP_NAME_SRC = `${GROUP_WORD}${GROUP_CONNECTOR}*`;

const WEIGHT_ROW_RE = new RegExp(`(${GROUP_NAME_SRC})\\s+(\\d{1,3}(?:[.,]\\d+)?)\\s*%`, "g");

const NUM_SRC = "\\d+(?:[.,]\\d+)?";
const SCORE_RE = new RegExp(`(-|${NUM_SRC})\\s*\\/\\s*(${NUM_SRC})`, "g");
const BARE_FRACTION_RE = /^[\d:.,\s-]*\/[\d:.,\s-]*$/;

function parseLocaleNumber(value: string): number {
  return parseFloat(value.replace(",", "."));
}

function stripAll(text: string, patterns: RegExp[]): string {
  let result = text;
  for (const p of patterns) result = result.replace(p, " ");
  return result;
}

function extractTitleFromFilename(fileName: string): string | null {
  const withoutExt = fileName.replace(/\.pdf$/i, "");
  const afterPrefix = withoutExt.replace(/^.*?_\s*/, "");
  const cleaned = afterPrefix.replace(/^\[[^\]]+\]\s*-\s*/, "").trim();
  return /[a-zà-ÿ]/i.test(cleaned) ? cleaned : null;
}

function extractTitleFromPdfText(firstPageText: string): string | null {
  const m = firstPageText.match(
    /\]\s*-\s*(.+?)\s+(?:Fecha de entrega|Due Date|Delivery date|Data de entrega|Sort by|Organizar por)\s+/i,
  );
  return m?.[1]?.trim() || null;
}

function resolveCourseTitle(
  fileName: string,
  firstPageText: string,
  fallbackTitle: string,
): string {
  return (
    extractTitleFromFilename(fileName) ??
    extractTitleFromPdfText(firstPageText) ??
    fallbackTitle
  );
}

function extractExplicitWeights(
  fullText: string,
): { name: string; weightPercent: number }[] | null {
  const hasWeightTable = WEIGHT_TABLE_MARKERS.some((m) => m.test(fullText));
  if (!hasWeightTable) return null;

  const results: { name: string; weightPercent: number }[] = [];
  const re = new RegExp(WEIGHT_ROW_RE.source, "g");
  let m: RegExpExecArray | null;
  while ((m = re.exec(fullText)) !== null) {
    const name = m[1].trim();
    if (name.toUpperCase() === "TOTAL") continue;
    results.push({ name, weightPercent: parseLocaleNumber(m[2]) });
  }
  return results.length > 0 ? results : null;
}

function buildGroups(
  fullText: string,
  assignments: CanvasParsedAssignment[],
): { groups: CanvasParsedGroup[]; weightsWereDerived: boolean } {
  const groupNames: string[] = [];
  for (const a of assignments) {
    if (!groupNames.includes(a.groupName)) groupNames.push(a.groupName);
  }

  const explicit = extractExplicitWeights(fullText);
  if (explicit && explicit.length > 0) {
    const explicitNames = new Set(explicit.map((e) => e.name));
    const groups = explicit.map((e) => ({
      name: e.name,
      weightPercent: Math.round(e.weightPercent * 10) / 10,
    }));
    for (const name of groupNames) {
      if (!explicitNames.has(name)) groups.push({ name, weightPercent: 0 });
    }
    return { groups, weightsWereDerived: false };
  }

  const possibleByGroup = new Map<string, number>();
  for (const a of assignments) {
    if (a.maxPoints !== null && a.maxPoints > 0) {
      possibleByGroup.set(a.groupName, (possibleByGroup.get(a.groupName) ?? 0) + a.maxPoints);
    }
  }
  const totalPossible = [...possibleByGroup.values()].reduce((sum, v) => sum + v, 0);

  const groups = groupNames.map((name) => ({
    name,
    weightPercent:
      totalPossible > 0
        ? Math.round(((possibleByGroup.get(name) ?? 0) / totalPossible) * 1000) / 10
        : 0,
  }));

  if (totalPossible > 0 && groups.length > 0) {
    const rounded = Math.round(groups.reduce((sum, g) => sum + g.weightPercent, 0) * 10) / 10;
    const residual = Math.round((100 - rounded) * 10) / 10;
    if (residual !== 0) {
      const largest = groups.reduce((max, g) => (g.weightPercent > max.weightPercent ? g : max));
      largest.weightPercent = Math.round((largest.weightPercent + residual) * 10) / 10;
    }
  }

  return { groups, weightsWereDerived: true };
}

function extractTitleGroupPairs(
  titlePhaseText: string,
  carryTitle: string,
): { pairs: { title: string; groupName: string }[]; danglingTitle: string } {
  const pairs: { title: string; groupName: string }[] = [];
  const re = new RegExp(GROUP_NAME_SRC, "g");
  let lastIndex = 0;
  let isFirstMatch = true;
  let m: RegExpExecArray | null;
  while ((m = re.exec(titlePhaseText)) !== null) {
    const groupName = m[0].trim();
    let title = titlePhaseText.slice(lastIndex, m.index).trim();
    // An assignment's title can be split from its own group name across a
    // page break (the title ends one page, the group name starts the next).
    // When this page's very first match has no title of its own, the
    // previous page's dangling title (if any) belongs to it instead.
    if (isFirstMatch && title.length === 0 && carryTitle) {
      title = carryTitle;
    }
    isFirstMatch = false;
    if (title.length > 0 && groupName.length > 0) {
      pairs.push({ title, groupName });
    }
    lastIndex = re.lastIndex;
  }

  // Whatever is left after the last group-name match is either page noise
  // (scores, totals) or a dangling title cut off by a page break. Only the
  // latter is short, letter-containing, and free of score fractions.
  const rawTail = titlePhaseText.slice(lastIndex).trim();
  const beforeFirstSlash = rawTail.includes("/") ? rawTail.slice(0, rawTail.indexOf("/")) : rawTail;
  const candidateTail = beforeFirstSlash.replace(/\d+\s*$/, "").trim();
  const danglingTitle =
    candidateTail.length > 1 && candidateTail.length < 60 && /[a-zà-ÿ]/i.test(candidateTail)
      ? candidateTail
      : "";

  return { pairs, danglingTitle };
}

const PROFESSIONALISM_RE =
  /professionalism|profesionalismo|profissionalismo|attendance|asistencia|assist[êe]ncia|assiduidade/i;

function isProfessionalismAssignment(title: string, groupName: string): boolean {
  return PROFESSIONALISM_RE.test(title) || PROFESSIONALISM_RE.test(groupName);
}

// When the last assignment before the group-totals block has no due date
// (common for a manually-graded "Professionalism & Assistance" entry), its
// own group label runs straight into the totals block's first row with no
// separating text, and the greedy group-name match glues them into one
// bogus group (e.g. "PROFESSIONALISM & ASSISTANCE  DISCUSSION FORUMS"). Since
// a real group name that was already seen never recurs by growing a new
// group's name as its suffix, any groupName ending in an already-known group
// name (with real content left over) is really two groups pasted together —
// trim it back to the leftover prefix, which is the assignment's true group.
function fixMergedGroupNames(assignments: CanvasParsedAssignment[]): void {
  const knownGroups = new Set<string>();
  for (const a of assignments) {
    if (!knownGroups.has(a.groupName)) {
      for (const known of knownGroups) {
        const prefixLength = a.groupName.length - known.length;
        if (
          prefixLength > 3 &&
          a.groupName.endsWith(known) &&
          a.groupName.slice(0, prefixLength).trim().length > 3
        ) {
          a.groupName = a.groupName.slice(0, prefixLength).trim();
          break;
        }
      }
    }
    knownGroups.add(a.groupName);
  }
}

function extractScores(text: string): { score: number | null; maxPoints: number }[] {
  const scores: { score: number | null; maxPoints: number }[] = [];
  const re = new RegExp(SCORE_RE.source, "g");
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    scores.push({
      score: m[1] === "-" ? null : parseLocaleNumber(m[1]),
      maxPoints: parseLocaleNumber(m[2]),
    });
  }
  return scores;
}

function stripPageHeader(text: string): string {
  for (const pattern of PAGE_HEADER_END_MARKERS) {
    const m = text.match(pattern);
    if (m && m.index !== undefined) {
      return text.slice(m.index + m[0].length);
    }
  }
  return text;
}

function parsePage(
  pageText: string,
  carryTitle: string,
): {
  pairs: { title: string; groupName: string }[];
  scores: { score: number | null; maxPoints: number }[];
  danglingTitle: string;
} {
  let cleaned = stripPageHeader(pageText);
  cleaned = stripAll(cleaned, PRINT_BUTTON_NOISE);
  cleaned = stripAll(cleaned, COURSE_DROPDOWN_NOISE);
  cleaned = stripAll(cleaned, TAB_LABEL_NOISE);
  cleaned = stripAll(cleaned, DATE_PATTERNS);

  const { pairs: allPairs, danglingTitle } = extractTitleGroupPairs(cleaned, carryTitle);
  const pairs = allPairs.filter(
    (p) => !BARE_FRACTION_RE.test(p.title) && p.title.length > 1,
  );
  const allScores = extractScores(cleaned);
  const scores = allScores.slice(-pairs.length);

  return { pairs, scores, danglingTitle };
}

export async function parseCanvasPdfFile(
  file: File,
  fallbackTitle: string,
): Promise<CanvasPdfParseResult> {
  const pages = await extractTextPagesFromPdf(file);
  if (pages.length === 0) {
    return { success: false, error: "no_data_found" };
  }

  const fullText = pages.join(" ");
  const title = resolveCourseTitle(file.name, pages[0], fallbackTitle);

  const assignments: CanvasParsedAssignment[] = [];
  let hasAlignmentWarning = false;
  let carryTitle = "";

  for (const pageText of pages) {
    const { pairs, scores, danglingTitle } = parsePage(pageText, carryTitle);
    carryTitle = danglingTitle;
    if (pairs.length !== scores.length) hasAlignmentWarning = true;

    const count = Math.min(pairs.length, scores.length);
    for (let i = 0; i < count; i++) {
      assignments.push({
        name: pairs[i].title,
        groupName: pairs[i].groupName,
        score: scores[i].score,
        maxPoints: scores[i].maxPoints,
        isProfessionalism: isProfessionalismAssignment(pairs[i].title, pairs[i].groupName),
      });
    }
    for (let i = count; i < pairs.length; i++) {
      assignments.push({
        name: pairs[i].title,
        groupName: pairs[i].groupName,
        score: null,
        maxPoints: null,
        isProfessionalism: isProfessionalismAssignment(pairs[i].title, pairs[i].groupName),
      });
    }
  }

  fixMergedGroupNames(assignments);

  const { groups, weightsWereDerived } = buildGroups(fullText, assignments);

  if (assignments.length === 0 && groups.length === 0) {
    return { success: false, error: "no_data_found" };
  }

  return {
    success: true,
    title,
    groups,
    assignments,
    weightsWereDerived,
    hasAlignmentWarning,
  };
}
