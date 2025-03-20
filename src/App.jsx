import { BrowserRouter, Routes, Route } from "react-router-dom";
import Signin from "./auth/signin.jsx";
import QrScanner from "./pages/qrscanner.jsx";
import Checkqr from "./pages/checkqr.jsx";
import ManualVerification from "./pages/manualVerification.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Signin />} />
        <Route path="/qrscanner" element={<QrScanner />} />
        <Route path="/checkId/:id" element={<Checkqr />} />
        <Route path="/manualVerification" element={<ManualVerification />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
