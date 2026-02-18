import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  Download,
  Upload,
  AlertCircle,
  CheckCircle,
  FileText,
} from "lucide-react";
import { useGpa } from "../contexts/GpaContext";
import { storageService } from "../services/storageService";

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
    const bgColor = isSuccess ? "bg-green-500/20" : "bg-red-500/20";
    const textColor = isSuccess ? "text-green-400" : "text-red-400";
    const iconColor = isSuccess ? "text-green-400" : "text-red-400";
    const borderColor = isSuccess ? "border-green-500/30" : "border-red-500/30";

    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`${bgColor} ${borderColor} border rounded-lg p-3 flex items-center space-x-2 backdrop-blur-sm`}
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
          <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
            <Download className="w-5 h-5 text-jala-blue-400" />
            <span>Export Data</span>
          </h3>

          <p className="text-sm text-cosmic-300">
            Download your current grades and settings as a JSON file for backup
            purposes.
          </p>

          <button
            onClick={handleExport}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-jala-blue-600/80 text-white rounded-lg hover:bg-jala-blue-500/80 transition-colors backdrop-blur-sm"
          >
            <Download className="w-5 h-5" />
            <span>Export JSON</span>
          </button>

          {exportStatus && <StatusAlert status={exportStatus} />}
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
            <Upload className="w-5 h-5 text-space-400" />
            <span>Import Data</span>
          </h3>

          <p className="text-sm text-cosmic-300">
            Upload a previously exported JSON file to restore your grades and
            settings.
          </p>

          <button
            onClick={handleImportClick}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-space-600/80 text-white rounded-lg hover:bg-space-500/80 transition-colors backdrop-blur-sm"
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

      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 backdrop-blur-sm">
        <div className="flex items-start space-x-3">
          <FileText className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
          <div className="space-y-2">
            <h4 className="font-medium text-yellow-400">Important Notes</h4>
            <ul className="text-sm text-cosmic-300 space-y-1">
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
