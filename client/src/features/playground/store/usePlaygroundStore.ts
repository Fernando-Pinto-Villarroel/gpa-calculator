import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { PlaygroundAssignment, PlaygroundAssignmentGroup, PlaygroundCourse } from "../types";
import {
  buildDefaultAssignments,
  buildDefaultGroups,
  buildDefaultPlayground,
  KNOWN_DEFAULT_TITLES,
  PlaygroundTranslator,
} from "../data/defaultPlayground";

function generateId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

interface PlaygroundState {
  course: PlaygroundCourse | null;
  ensureInitialized: (t: PlaygroundTranslator) => void;
  syncDefaultLocalization: (t: PlaygroundTranslator) => void;
  setCourse: (course: PlaygroundCourse) => void;
  setTitle: (title: string) => void;
  addGroup: (group: Omit<PlaygroundAssignmentGroup, "id">) => void;
  updateGroup: (id: string, patch: Partial<Omit<PlaygroundAssignmentGroup, "id">>) => void;
  removeGroup: (id: string) => void;
  resetGroups: (t: PlaygroundTranslator) => void;
  addAssignment: (assignment: Omit<PlaygroundAssignment, "id">) => void;
  updateAssignment: (id: string, patch: Partial<Omit<PlaygroundAssignment, "id">>) => void;
  removeAssignment: (id: string) => void;
  reorderAssignments: (assignments: PlaygroundAssignment[]) => void;
  resetAssignments: (t: PlaygroundTranslator) => void;
}

export const usePlaygroundStore = create<PlaygroundState>()(
  persist(
    (set) => ({
      course: null,

      ensureInitialized: (t) =>
        set((state) => (state.course ? state : { course: buildDefaultPlayground(t) })),

      syncDefaultLocalization: (t) =>
        set((state) => {
          if (!state.course) return state;

          const freshGroups = buildDefaultGroups(t);
          const freshAssignments = buildDefaultAssignments(t);

          const groups = state.course.groups.map((g) => {
            if (g.nameCustomized) return g;
            const fresh = freshGroups.find((fg) => fg.id === g.id);
            return fresh && fresh.name !== g.name ? { ...g, name: fresh.name } : g;
          });

          const assignments = state.course.assignments.map((a) => {
            if (a.nameCustomized) return a;
            const fresh = freshAssignments.find((fa) => fa.id === a.id);
            return fresh && fresh.name !== a.name ? { ...a, name: fresh.name } : a;
          });

          const title = KNOWN_DEFAULT_TITLES.includes(state.course.title)
            ? t("default_title")
            : state.course.title;

          return { course: { ...state.course, title, groups, assignments } };
        }),

      setCourse: (course) => set({ course }),

      setTitle: (title) =>
        set((state) => (state.course ? { course: { ...state.course, title } } : state)),

      addGroup: (group) =>
        set((state) => {
          if (!state.course) return state;
          const newGroup: PlaygroundAssignmentGroup = { ...group, id: generateId("group") };
          return { course: { ...state.course, groups: [...state.course.groups, newGroup] } };
        }),

      updateGroup: (id, patch) =>
        set((state) => {
          if (!state.course) return state;
          return {
            course: {
              ...state.course,
              groups: state.course.groups.map((g) =>
                g.id === id
                  ? {
                      ...g,
                      ...patch,
                      ...("name" in patch ? { nameCustomized: true } : {}),
                    }
                  : g,
              ),
            },
          };
        }),

      removeGroup: (id) =>
        set((state) => {
          if (!state.course) return state;
          return {
            course: {
              ...state.course,
              groups: state.course.groups.filter((g) => g.id !== id),
            },
          };
        }),

      resetGroups: (t) =>
        set((state) => (state.course ? { course: { ...state.course, groups: buildDefaultGroups(t) } } : state)),

      addAssignment: (assignment) =>
        set((state) => {
          if (!state.course) return state;
          const newAssignment: PlaygroundAssignment = {
            ...assignment,
            id: generateId("assignment"),
          };
          return {
            course: { ...state.course, assignments: [newAssignment, ...state.course.assignments] },
          };
        }),

      updateAssignment: (id, patch) =>
        set((state) => {
          if (!state.course) return state;
          return {
            course: {
              ...state.course,
              assignments: state.course.assignments.map((a) =>
                a.id === id
                  ? {
                      ...a,
                      ...patch,
                      ...("name" in patch ? { nameCustomized: true } : {}),
                    }
                  : a,
              ),
            },
          };
        }),

      removeAssignment: (id) =>
        set((state) => {
          if (!state.course) return state;
          return {
            course: {
              ...state.course,
              assignments: state.course.assignments.filter((a) => a.id !== id),
            },
          };
        }),

      reorderAssignments: (assignments) =>
        set((state) => (state.course ? { course: { ...state.course, assignments } } : state)),

      resetAssignments: (t) =>
        set((state) =>
          state.course ? { course: { ...state.course, assignments: buildDefaultAssignments(t) } } : state,
        ),
    }),
    {
      name: "jala-canvas-playground",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
