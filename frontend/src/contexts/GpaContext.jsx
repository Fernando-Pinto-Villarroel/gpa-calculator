import { createContext, useContext, useReducer, useEffect } from "react";
import { TERM_STRUCTURES } from "@data/termStructures";
import { storageService } from "@services/storageService";

const GpaContext = createContext();

const initialState = {
  selectedTerm: "Term 2-2024+",
  grades: {},
  loading: true,
};

function gpaReducer(state, action) {
  switch (action.type) {
    case "SET_SELECTED_TERM":
      return {
        ...state,
        selectedTerm: action.payload,
      };
    case "SET_GRADES":
      return {
        ...state,
        grades: action.payload,
      };
    case "UPDATE_GRADE":
      return {
        ...state,
        grades: {
          ...state.grades,
          [action.payload.courseId]: action.payload.grade,
        },
      };
    case "RESET_GRADES":
      return {
        ...state,
        grades: {},
      };
    case "SET_LOADING":
      return {
        ...state,
        loading: action.payload,
      };
    default:
      return state;
  }
}

export function GpaProvider({ children }) {
  const [state, dispatch] = useReducer(gpaReducer, initialState);

  useEffect(() => {
    const loadData = async () => {
      try {
        const savedData = storageService.loadGpaData();
        if (savedData) {
          dispatch({
            type: "SET_SELECTED_TERM",
            payload: savedData.selectedTerm || "Term 2-2024+",
          });
          dispatch({ type: "SET_GRADES", payload: savedData.grades || {} });
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (!state.loading) {
      storageService.saveGpaData({
        selectedTerm: state.selectedTerm,
        grades: state.grades,
      });
    }
  }, [state.selectedTerm, state.grades, state.loading]);

  const setSelectedTerm = (term) => {
    dispatch({ type: "SET_SELECTED_TERM", payload: term });
  };

  const updateGrade = (courseId, grade) => {
    dispatch({ type: "UPDATE_GRADE", payload: { courseId, grade } });
  };

  const resetGrades = () => {
    dispatch({ type: "RESET_GRADES" });
  };

  const importData = (data) => {
    try {
      if (data.selectedTerm) {
        dispatch({ type: "SET_SELECTED_TERM", payload: data.selectedTerm });
      }
      if (data.grades) {
        dispatch({ type: "SET_GRADES", payload: data.grades });
      }
      return true;
    } catch (error) {
      console.error("Error importing data:", error);
      return false;
    }
  };

  const exportData = () => {
    return {
      selectedTerm: state.selectedTerm,
      grades: state.grades,
      exportDate: new Date().toISOString(),
    };
  };

  const value = {
    selectedTerm: state.selectedTerm,
    grades: state.grades,
    loading: state.loading,
    termStructure: TERM_STRUCTURES[state.selectedTerm] || {},
    setSelectedTerm,
    updateGrade,
    resetGrades,
    importData,
    exportData,
  };

  return <GpaContext.Provider value={value}>{children}</GpaContext.Provider>;
}

export function useGpa() {
  const context = useContext(GpaContext);
  if (!context) {
    throw new Error("useGpa must be used within a GpaProvider");
  }
  return context;
}
