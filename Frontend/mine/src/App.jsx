import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import MainDashboard from './pages/MainDashboard';
import ProjectsDashboard from './pages/ProjectsDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to = "/Login" />}></Route> /
               <Route path="/login" element={<Login/>}></Route> /
               <Route path="/Main-dashboard" element={<MainDashboard/>}></Route> /
                <Route path="/Projects-dashboard" element={<ProjectsDashboard/>}></Route> /
      </Routes>
    </BrowserRouter>
  );
}

export default App;

