import { Course, Term } from "@/core/domain/types/course";
import { LetterGrade, letterGradesMap } from "@/core/domain/types/letterGrades";
import {
  CourseGradeEntry,
  isCourseAttempts,
  isCourseApproved,
  hasGradeData,
  getEffectiveCredits,
} from "@/core/domain/types/grades";

export type ForecastScope = "term" | "cumulative";

export interface RemainingCourse {
  courseCode: string;
  credits: number;
  termOrdinal: string;
}

export interface ForecastContext {
  currentQualityPoints: number;
  currentAttemptedCredits: number;
  remainingCourses: RemainingCourse[];
  totalRemainingCredits: number;
}

export interface UniformScenario {
  grade: LetterGrade;
  projectedGpa: number;
  meetsTarget: boolean;
}

export interface GradeAllocation {
  grade: LetterGrade;
  count: number;
  creditGroups: { credits: number; count: number }[];
}

export interface GradeCombination {
  allocations: GradeAllocation[];
  projectedGpa: number;
}

export interface ForecastResult {
  feasible: boolean;
  feasibleWithAllowedGrades: boolean;
  alreadyAchieved: boolean;
  currentGpa: number;
  remainingCourseCount: number;
  remainingCredits: number;
  uniformScenarios: UniformScenario[];
  combinations: GradeCombination[];
}

function computeEntryQPAndCredits(
  entry: CourseGradeEntry,
  course: Course,
): { qp: number; ac: number } {
  if (!hasGradeData(entry)) return { qp: 0, ac: 0 };

  const gpaWeight = course.gpaWeight ?? course.credits;

  if (isCourseAttempts(entry)) {
    let qp = 0;
    let ac = 0;
    entry.forEach((a) => {
      if (a.grade === null) return;
      const weight = course.gpaWeight ?? a.credits;
      qp += letterGradesMap[a.grade] * weight;
      ac += weight;
    });
    return { qp, ac };
  }

  const grade = entry as LetterGrade;
  return {
    qp: letterGradesMap[grade] * gpaWeight,
    ac: gpaWeight,
  };
}

function isPendingOptionalCourse(course: Course, entry: CourseGradeEntry): boolean {
  return Boolean(course.optional) && !hasGradeData(entry);
}

export function buildForecastContext(
  grades: Record<string, CourseGradeEntry>,
  terms: Term[],
  scope: ForecastScope,
  termId?: string,
): ForecastContext {
  let currentQP = 0;
  let currentAC = 0;
  const remaining: RemainingCourse[] = [];

  const scopeTerms =
    scope === "term" && termId
      ? terms.filter((t) => t.id === termId)
      : terms;

  scopeTerms.forEach((term) => {
    Object.values(term.modules).forEach((courses) => {
      courses.forEach((course) => {
        const entry = grades[course.courseCode];
        if (isPendingOptionalCourse(course, entry)) return;

        if (hasGradeData(entry)) {
          const { qp, ac } = computeEntryQPAndCredits(entry, course);
          currentQP += qp;
          currentAC += ac;
        }
        if (!isCourseApproved(entry)) {
          const gpaWeight = course.gpaWeight ?? course.credits;
          remaining.push({
            courseCode: course.courseCode,
            credits: getEffectiveCredits(entry, gpaWeight),
            termOrdinal: term.ordinal,
          });
        }
      });
    });
  });

  return {
    currentQualityPoints: currentQP,
    currentAttemptedCredits: currentAC,
    remainingCourses: remaining,
    totalRemainingCredits: remaining.reduce((s, c) => s + c.credits, 0),
  };
}

export function computeUniformScenarios(
  ctx: ForecastContext,
  targetGpa: number,
  grades: LetterGrade[],
): UniformScenario[] {
  const totalNewCredits = ctx.totalRemainingCredits;
  const totalAC = ctx.currentAttemptedCredits + totalNewCredits;

  const sorted = [...grades].sort(
    (a, b) => letterGradesMap[b] - letterGradesMap[a],
  );

  return sorted.map((grade) => {
    const additionalQP = letterGradesMap[grade] * totalNewCredits;
    const projectedGpa =
      totalAC > 0
        ? (ctx.currentQualityPoints + additionalQP) / totalAC
        : 0;
    return { grade, projectedGpa, meetsTarget: projectedGpa >= targetGpa };
  });
}

function binomialCount(n: number, k: number): number {
  if (k > n) return 0;
  if (k === 0 || k === n) return 1;
  let result = 1;
  for (let i = 0; i < k; i++) {
    result = (result * (n - i)) / (i + 1);
  }
  return result;
}

export function findCombinations(
  ctx: ForecastContext,
  targetGpa: number,
  allowedGrades: LetterGrade[],
  maxResults: number,
): GradeCombination[] {
  const K = ctx.remainingCourses.length;
  if (K === 0) return [];

  const grades = [...allowedGrades].sort(
    (a, b) => letterGradesMap[b] - letterGradesMap[a],
  );
  const G = grades.length;
  if (G === 0) return [];

  const courseCredits = [...ctx.remainingCourses]
    .sort((a, b) => b.credits - a.credits)
    .map((c) => c.credits);

  const totalNewCredits = ctx.totalRemainingCredits;
  const totalAC = ctx.currentAttemptedCredits + totalNewCredits;
  const neededQP = targetGpa * totalAC - ctx.currentQualityPoints;

  const maxPossibleQP = courseCredits.reduce(
    (s, cr) => s + letterGradesMap[grades[0]] * cr,
    0,
  );
  if (maxPossibleQP < neededQP) return [];

  if (neededQP <= 0) {
    const lowestGrade = grades[G - 1];
    const qp =
      ctx.currentQualityPoints +
      courseCredits.reduce((s, cr) => s + letterGradesMap[lowestGrade] * cr, 0);
    const creditMap: Record<number, number> = {};
    courseCredits.forEach((cr) => {
      creditMap[cr] = (creditMap[cr] ?? 0) + 1;
    });
    return [
      {
        allocations: [
          {
            grade: lowestGrade,
            count: K,
            creditGroups: Object.entries(creditMap)
              .map(([cr, cnt]) => ({ credits: Number(cr), count: cnt }))
              .sort((a, b) => b.credits - a.credits),
          },
        ],
        projectedGpa: qp / totalAC,
      },
    ];
  }

  const totalDistributions = binomialCount(K + G - 1, G - 1);
  if (totalDistributions > 200000) {
    return findCombinationsGreedy(ctx, targetGpa, grades, courseCredits, maxResults);
  }

  const results: GradeCombination[] = [];

  function search(gradeIdx: number, remaining: number, dist: number[]) {
    if (results.length >= maxResults * 20) return;

    if (gradeIdx === G - 1) {
      dist.push(remaining);
      let qp = 0;
      let courseIdx = 0;
      for (let g = 0; g < G; g++) {
        for (let j = 0; j < dist[g]; j++) {
          qp += letterGradesMap[grades[g]] * courseCredits[courseIdx];
          courseIdx++;
        }
      }
      if (qp >= neededQP) {
        const gpa = (ctx.currentQualityPoints + qp) / totalAC;
        const allocations: GradeAllocation[] = [];
        let ci = 0;
        for (let g = 0; g < G; g++) {
          if (dist[g] > 0) {
            const creditMap: Record<number, number> = {};
            for (let j = 0; j < dist[g]; j++) {
              const cr = courseCredits[ci];
              creditMap[cr] = (creditMap[cr] ?? 0) + 1;
              ci++;
            }
            allocations.push({
              grade: grades[g],
              count: dist[g],
              creditGroups: Object.entries(creditMap)
                .map(([cr, cnt]) => ({ credits: Number(cr), count: cnt }))
                .sort((a, b) => b.credits - a.credits),
            });
          } else {
            ci += dist[g];
          }
        }
        results.push({ allocations, projectedGpa: gpa });
      }
      dist.pop();
      return;
    }

    // Try higher counts of this grade first (grades are sorted best-to-worst,
    // so this explores the highest-GPA combinations first). Since the search
    // below is capped at maxResults * 20 results for performance, exploring
    // low-to-high here would fill that cap with worst-first combinations,
    // potentially never reaching any that use the best allowed grade at all.
    for (let count = remaining; count >= 0; count--) {
      dist.push(count);
      search(gradeIdx + 1, remaining - count, dist);
      dist.pop();
    }
  }

  search(0, K, []);

  results.sort((a, b) => b.projectedGpa - a.projectedGpa);

  return results.slice(0, maxResults);
}

function findCombinationsGreedy(
  ctx: ForecastContext,
  targetGpa: number,
  grades: LetterGrade[],
  courseCredits: number[],
  maxResults: number,
): GradeCombination[] {
  const G = grades.length;
  const K = courseCredits.length;
  const totalAC = ctx.currentAttemptedCredits + ctx.totalRemainingCredits;
  const neededQP = targetGpa * totalAC - ctx.currentQualityPoints;
  const results: GradeCombination[] = [];

  const gradeValues = grades.map((g) => letterGradesMap[g]);
  const lowestValue = gradeValues[G - 1];

  function buildFromAssignment(assignment: number[]): GradeCombination {
    let qp = 0;
    const gradeCreditsMap: Record<string, Record<number, number>> = {};
    for (let i = 0; i < K; i++) {
      qp += gradeValues[assignment[i]] * courseCredits[i];
      const grade = grades[assignment[i]];
      if (!gradeCreditsMap[grade]) gradeCreditsMap[grade] = {};
      gradeCreditsMap[grade][courseCredits[i]] =
        (gradeCreditsMap[grade][courseCredits[i]] ?? 0) + 1;
    }
    const allocations: GradeAllocation[] = [];
    for (const [grade, creditMap] of Object.entries(gradeCreditsMap)) {
      allocations.push({
        grade: grade as LetterGrade,
        count: Object.values(creditMap).reduce((s, c) => s + c, 0),
        creditGroups: Object.entries(creditMap)
          .map(([cr, cnt]) => ({ credits: Number(cr), count: cnt }))
          .sort((a, b) => b.credits - a.credits),
      });
    }
    allocations.sort(
      (a, b) => letterGradesMap[b.grade] - letterGradesMap[a.grade],
    );
    return {
      allocations,
      projectedGpa: (ctx.currentQualityPoints + qp) / totalAC,
    };
  }

  const baseAssignment = new Array(K).fill(G - 1);
  let baseQP = courseCredits.reduce((s, cr) => s + lowestValue * cr, 0);

  if (baseQP >= neededQP) {
    results.push(buildFromAssignment(baseAssignment));
    return results;
  }

  for (let startIdx = 0; startIdx < Math.min(maxResults, K); startIdx++) {
    const assignment = new Array(K).fill(G - 1);
    let currentQP = baseQP;
    const maxIterations = K * (G - 1);
    let iterations = 0;
    while (currentQP < neededQP && iterations < maxIterations) {
      const i = (startIdx + iterations) % K;
      if (assignment[i] > 0) {
        const oldValue = gradeValues[assignment[i]];
        assignment[i]--;
        const newValue = gradeValues[assignment[i]];
        currentQP += (newValue - oldValue) * courseCredits[i];
      }
      iterations++;
    }

    if (currentQP >= neededQP) {
      results.push(buildFromAssignment(assignment));
    }
  }

  results.sort((a, b) => b.projectedGpa - a.projectedGpa);

  return results;
}

export function forecast(
  grades: Record<string, CourseGradeEntry>,
  terms: Term[],
  scope: ForecastScope,
  termId: string | undefined,
  targetGpa: number,
  allowedGrades: LetterGrade[],
  maxCombinations: number,
): ForecastResult {
  const ctx = buildForecastContext(grades, terms, scope, termId);
  const totalAC = ctx.currentAttemptedCredits + ctx.totalRemainingCredits;
  const currentGpa =
    ctx.currentAttemptedCredits > 0
      ? ctx.currentQualityPoints / ctx.currentAttemptedCredits
      : 0;

  if (ctx.remainingCourses.length === 0) {
    return {
      feasible: currentGpa >= targetGpa,
      feasibleWithAllowedGrades: currentGpa >= targetGpa,
      alreadyAchieved: currentGpa >= targetGpa,
      currentGpa,
      remainingCourseCount: 0,
      remainingCredits: 0,
      uniformScenarios: [],
      combinations: [],
    };
  }

  const maxPossibleQP =
    ctx.currentQualityPoints +
    ctx.remainingCourses.reduce((s, c) => s + 4.0 * c.credits, 0);
  const maxPossibleGpa = totalAC > 0 ? maxPossibleQP / totalAC : 0;
  const feasible = maxPossibleGpa >= targetGpa;
  const alreadyAchieved = currentGpa >= targetGpa && ctx.currentAttemptedCredits > 0;

  const bestAllowedValue = allowedGrades.reduce(
    (best, g) => Math.max(best, letterGradesMap[g]),
    0,
  );
  const maxPossibleQPWithAllowed =
    ctx.currentQualityPoints +
    ctx.remainingCourses.reduce((s, c) => s + bestAllowedValue * c.credits, 0);
  const maxPossibleGpaWithAllowed = totalAC > 0 ? maxPossibleQPWithAllowed / totalAC : 0;
  const feasibleWithAllowedGrades = maxPossibleGpaWithAllowed >= targetGpa;

  const uniformScenarios = computeUniformScenarios(
    ctx,
    targetGpa,
    allowedGrades,
  );

  const combinations = findCombinations(
    ctx,
    targetGpa,
    allowedGrades,
    maxCombinations,
  );

  return {
    feasible,
    feasibleWithAllowedGrades,
    alreadyAchieved,
    currentGpa,
    remainingCourseCount: ctx.remainingCourses.length,
    remainingCredits: ctx.totalRemainingCredits,
    uniformScenarios,
    combinations,
  };
}
