import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { GpaProvider } from "@contexts/GpaContext";
import Layout from "@components/Layout";
import GpaCalculatorPage from "@pages/GpaCalculatorPage";
import ConfigurationPage from "@pages/ConfigurationPage";

function App() {
  return (
    <GpaProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<GpaCalculatorPage />} />
            <Route path="/config" element={<ConfigurationPage />} />
          </Routes>
        </Layout>
      </Router>
    </GpaProvider>
  );
}

export default App;
