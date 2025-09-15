import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  Download,
  Upload,
  AlertCircle,
  CheckCircle,
  FileText,
} from "lucide-react";
import { useGpa } from "@contexts/GpaContext";
import { storageService } from "@services/storageService";

function ImportExportSection() {
  const { exportData, importData } = useGpa();
  const [importStatus, setImportStatus] = useState(null);
  const [exportStatus, setExportStatus] = useState(null);
  const fileInputRef = useRef(null);

  const handleExport = () => {
    try {
      const data = exportData();
      const success = storageService.exportToFile(data);

      if (success) {
        setExportStatus({
          type: "success",
          message: "Data exported successfully!",
        });
      } else {
        setExportStatus({ type: "error", message: "Failed to export data." });
      }
    } catch (error) {
      setExportStatus({ type: "error", message: "Error exporting data." });
    }

    setTimeout(() => setExportStatus(null), 3000);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const data = await storageService.importFromFile(file);
      const success = importData(data);

      if (success) {
        setImportStatus({
          type: "success",
          message: "Data imported successfully!",
        });
      } else {
        setImportStatus({ type: "error", message: "Invalid data format." });
      }
    } catch (error) {
      setImportStatus({
        type: "error",
        message: "Error reading file. Please check the file format.",
      });
    }

    event.target.value = "";
    setTimeout(() => setImportStatus(null), 3000);
  };

  const StatusAlert = ({ status, onClose }) => {
    if (!status) return null;

    const isSuccess = status.type === "success";
    const Icon = isSuccess ? CheckCircle : AlertCircle;
    const bgColor = isSuccess ? "bg-green-50" : "bg-red-50";
    const textColor = isSuccess ? "text-green-800" : "text-red-800";
    const iconColor = isSuccess ? "text-green-600" : "text-red-600";
    const borderColor = isSuccess ? "border-green-200" : "border-red-200";

    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`${bgColor} ${borderColor} border rounded-lg p-3 flex items-center space-x-2`}
      >
        <Icon className={`w-5 h-5 ${iconColor}`} />
        <span className={`text-sm ${textColor}`}>{status.message}</span>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <Download className="w-5 h-5 text-jala-blue-600" />
            <span>Export Data</span>
          </h3>

          <p className="text-sm text-gray-600">
            Download your current grades and settings as a JSON file for backup
            purposes.
          </p>

          <button
            onClick={handleExport}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-jala-blue-500 text-white rounded-lg hover:bg-jala-blue-600 transition-colors"
          >
            <Download className="w-5 h-5" />
            <span>Export JSON</span>
          </button>

          {exportStatus && <StatusAlert status={exportStatus} />}
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <Upload className="w-5 h-5 text-jala-cyan-600" />
            <span>Import Data</span>
          </h3>

          <p className="text-sm text-gray-600">
            Upload a previously exported JSON file to restore your grades and
            settings.
          </p>

          <button
            onClick={handleImportClick}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-jala-cyan-500 text-white rounded-lg hover:bg-jala-cyan-600 transition-colors"
          >
            <Upload className="w-5 h-5" />
            <span>Import JSON</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />

          {importStatus && <StatusAlert status={importStatus} />}
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <FileText className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div className="space-y-2">
            <h4 className="font-medium text-yellow-800">Important Notes</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>
                • Export your data regularly to avoid losing your progress
              </li>
              <li>
                • Only import files that were exported from this application
              </li>
              <li>• Importing will replace all current grades and settings</li>
              <li>
                • Data is automatically saved in your browser's local storage
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImportExportSection;
