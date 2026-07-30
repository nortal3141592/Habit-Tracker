import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Tracker from "./pages/Tracker";
import ErrorPage from "./pages/ErrorPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/trackers/:id" element={<Tracker />} />
      <Route path="*" element={<ErrorPage />} />
    </Routes>
  );
}

export default App;