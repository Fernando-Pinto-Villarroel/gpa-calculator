import { useMemo } from "react";
import { useGpa } from "@contexts/GpaContext";
import { gpaService } from "@services/gpaService";

export function useGpaCalculator() {
  const { termStructure, grades } = useGpa();

  const gpaData = useMemo(() => {
    return gpaService.getCourseStats(termStructure, grades);
  }, [termStructure, grades]);

  const honorsLevel = useMemo(() => {
    return gpaService.getHonorsLevel(gpaData.gpa);
  }, [gpaData.gpa]);

  const courses = useMemo(() => {
    return gpaService.getAllCourses(termStructure);
  }, [termStructure]);

  const calculateRequiredGrade = (targetGPA) => {
    return gpaService.calculateRequiredGradeForTarget(
      termStructure,
      grades,
      targetGPA
    );
  };

  return {
    gpaData,
    honorsLevel,
    courses,
    calculateRequiredGrade,
  };
}
