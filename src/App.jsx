import { BrowserRouter, Routes, Route } from "react-router-dom";

import Index from "./pages/Index"
import ManualAttendance from "./pages/ManualAttendance"
import RFIDLinker from "./pages/RFIDLinker"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<Index />} />
        <Route path="manual_attendance" element={<ManualAttendance />} />
        <Route path="rfid_link" element={<RFIDLinker />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
