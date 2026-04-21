import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import Topbar from './components/Topbar';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Feed from './pages/Feed';
import CreatorProfile from './pages/CreatorProfile';
import Dashboard from './pages/Dashboard';
import Wardrobe from './pages/Wardrobe';
import AddItem from './pages/AddItem';
import ItemDetail from './pages/ItemDetail';
import OutfitGenerator from './pages/OutfitGenerator';
import OutfitDetail from './pages/OutfitDetail';
import SavedOutfits from './pages/SavedOutfits';
import Boards from './pages/Boards';
import CreateBoard from './pages/CreateBoard';
import BoardDetail from './pages/BoardDetail';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminModeration from './pages/AdminModeration';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Topbar />
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/creator/:username" element={<CreatorProfile />} />

          {/* Creator (private) */}
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/wardrobe" element={<PrivateRoute><Wardrobe /></PrivateRoute>} />
          <Route path="/wardrobe/add" element={<PrivateRoute><AddItem /></PrivateRoute>} />
          <Route path="/wardrobe/:id" element={<PrivateRoute><ItemDetail /></PrivateRoute>} />
          <Route path="/outfit-generator" element={<PrivateRoute><OutfitGenerator /></PrivateRoute>} />
          <Route path="/outfit/new" element={<PrivateRoute><OutfitDetail /></PrivateRoute>} />
          <Route path="/outfit/:id" element={<PrivateRoute><OutfitDetail /></PrivateRoute>} />
          <Route path="/saved-outfits" element={<PrivateRoute><SavedOutfits /></PrivateRoute>} />
          <Route path="/boards" element={<PrivateRoute><Boards /></PrivateRoute>} />
          <Route path="/boards/create" element={<PrivateRoute><CreateBoard /></PrivateRoute>} />
          <Route path="/boards/:id" element={<PrivateRoute><BoardDetail /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute allowAdmin><Profile /></PrivateRoute>} />

          {/* Admin */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
          <Route path="/admin/moderation" element={<AdminRoute><AdminModeration /></AdminRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
