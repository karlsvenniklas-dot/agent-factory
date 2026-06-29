import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { MeetingPage } from "./pages/MeetingPage";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/meeting/:id" element={<MeetingPage />} />
      </Routes>
    </BrowserRouter>
  );
}
