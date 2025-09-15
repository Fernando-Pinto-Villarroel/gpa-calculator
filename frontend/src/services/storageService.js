const STORAGE_KEY = "jala-gpa-calculator";

export const storageService = {
  saveGpaData(data) {
    try {
      const jsonData = JSON.stringify(data);
      localStorage.setItem(STORAGE_KEY, jsonData);
      return true;
    } catch (error) {
      console.error("Error saving data to localStorage:", error);
      return false;
    }
  },

  loadGpaData() {
    try {
      const jsonData = localStorage.getItem(STORAGE_KEY);
      if (jsonData) {
        return JSON.parse(jsonData);
      }
      return null;
    } catch (error) {
      console.error("Error loading data from localStorage:", error);
      return null;
    }
  },

  clearGpaData() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (error) {
      console.error("Error clearing data from localStorage:", error);
      return false;
    }
  },

  exportToFile(data) {
    try {
      const jsonData = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonData], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `jala-gpa-backup-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      console.error("Error exporting data:", error);
      return false;
    }
  },

  importFromFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          resolve(data);
        } catch (error) {
          reject(new Error("Invalid JSON file"));
        }
      };

      reader.onerror = () => {
        reject(new Error("Error reading file"));
      };

      reader.readAsText(file);
    });
  },
};
