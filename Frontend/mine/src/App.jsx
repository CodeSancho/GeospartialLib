import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import MainDashboard from './pages/MainDashboard';

function RequireAuth() {
  return localStorage.getItem('token') ? <Outlet /> : <Navigate to="/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<RequireAuth />}>
          <Route path="/Main-dashboard" element={<MainDashboard />} />
          <Route path="/Projects-dashboard" element={<Navigate to="/Main-dashboard" replace />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
