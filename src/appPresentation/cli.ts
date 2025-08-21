import {
  calculateBasicStats,
  calculateCurrentGPA,
  calculateMaxCoursesWithGrade,
  getRemainingCourses,
} from "../core/application/services/calculator.js";
import {
  LetterGrade,
  letterGradesMap,
} from "../core/domain/types/letterGrades.js";
import readline from "readline";

export function startCLI(): void {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const stats = calculateBasicStats();
  console.log("\n===== ESTADÍSTICAS DEL PLAN DE ESTUDIOS =====");
  console.log(`Número de años: ${stats.numAnios}`);
  console.log(`Número de semestres: ${stats.numSemestres}`);
  console.log(`Número de materias en total: ${stats.numMateriasTotal}`);
  console.log(`Número de créditos en total: ${stats.creditosTotal}`);

  const { gpa, completedCredits, totalCompletedCourses } =
    calculateCurrentGPA();
  console.log("\n===== GPA ACTUAL =====");
  console.log(`GPA actual: ${gpa.toFixed(3)}`);
  console.log(`Créditos completados: ${completedCredits}`);
  console.log(`Cursos completados: ${totalCompletedCourses}`);

  const { courses: remainingCourses, totalCredits: remainingCredits } =
    getRemainingCourses();
  console.log("\n===== CURSOS PENDIENTES =====");
  console.log(`Cursos pendientes: ${remainingCourses.length}`);
  console.log(`Créditos pendientes: ${remainingCredits}`);

  promptForTargetGPA(rl, remainingCourses);
}

function promptForTargetGPA(
  rl: readline.Interface,
  remainingCourses: any[]
): void {
  rl.question(
    "\n¿Cuál es tu GPA objetivo? (por defecto 3.90): ",
    (targetGPAInput) => {
      const targetGPA = targetGPAInput ? parseFloat(targetGPAInput) : 3.9;
      promptForDefaultGrade(rl, targetGPA, remainingCourses);
    }
  );
}

function promptForDefaultGrade(
  rl: readline.Interface,
  targetGPA: number,
  remainingCourses: any[]
): void {
  rl.question(
    "¿Qué calificación planeas obtener generalmente en tus cursos restantes? (por defecto A): ",
    (defaultGradeInput) => {
      const defaultGrade = (defaultGradeInput || "A") as LetterGrade;
      promptForAlternateGrade(rl, targetGPA, defaultGrade, remainingCourses);
    }
  );
}

function promptForAlternateGrade(
  rl: readline.Interface,
  targetGPA: number,
  defaultGrade: LetterGrade,
  remainingCourses: any[]
): void {
  rl.question(
    "¿Qué calificación alternativa estás considerando? (por defecto A-): ",
    (alternateGradeInput) => {
      const alternateGrade = (alternateGradeInput || "A-") as LetterGrade;
      displayResults(
        rl,
        targetGPA,
        defaultGrade,
        alternateGrade,
        remainingCourses
      );
    }
  );
}

function displayResults(
  rl: readline.Interface,
  targetGPA: number,
  defaultGrade: LetterGrade,
  alternateGrade: LetterGrade,
  remainingCourses: any[]
): void {
  const maxCoursesWithAlternateGrade = calculateMaxCoursesWithGrade(
    targetGPA,
    defaultGrade,
    alternateGrade
  );

  console.log("\n===== RESULTADOS =====");
  console.log(`Para mantener un GPA de al menos ${targetGPA.toFixed(2)}:`);
  console.log(
    `- Calificación planeada para la mayoría de cursos: ${defaultGrade} (${letterGradesMap[defaultGrade]} puntos)`
  );
  console.log(
    `- Calificación alternativa: ${alternateGrade} (${letterGradesMap[alternateGrade]} puntos)`
  );
  console.log(
    `- Número máximo de cursos con calificación ${alternateGrade}: ${maxCoursesWithAlternateGrade} de ${remainingCourses.length} cursos pendientes`
  );

  if (maxCoursesWithAlternateGrade === 0) {
    console.log(
      `\n⚠️ ADVERTENCIA: No puedes permitirte ningún curso con calificación ${alternateGrade} si quieres mantener un GPA de ${targetGPA.toFixed(
        2
      )}.`
    );
  } else if (maxCoursesWithAlternateGrade === remainingCourses.length) {
    console.log(
      `\n✅ ¡Buenas noticias! Puedes obtener ${alternateGrade} en todos tus cursos restantes y aún mantener un GPA de ${targetGPA.toFixed(
        2
      )}.`
    );
  }

  rl.close();
}
