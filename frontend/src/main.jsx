
import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { Toaster } from 'react-hot-toast';
import { UserProvider } from './hooks/useUser';
import App from './App.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Login from './pages/Login.jsx';




import Register from './pages/Register.jsx';
import Home from './components/Home.jsx';
import Booked from './components/Booked.jsx';
import EditPost from './components/EditPost.jsx';
import AdminDashboard from './admin/AdminDashboard.jsx';
import AddBook from './admin/AddBook.jsx';
import ViewBook from './admin/ViewBook.jsx';




const router = createBrowserRouter([
  {
    path: "/", element: <App/>,
    children:[
      
        { path: '/login', 
          element: <Login/> },
            { path: '/Register', 
          element: <Register/> },

        { path: '/Home', 
          element: <Home /> },
         { path: '/edit/:id', 
          element: <EditPost /> },
          { path: '/Booked', 
          element: <Booked /> },
           { path: '/admin-dashboard', 
          element: <AdminDashboard /> },
           { path: '/addbook', 
          element: <AddBook /> },
           { path: '/viewbook', 
          element: <ViewBook /> },

         
    ]
  
  }
])
createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <UserProvider>

    <Toaster />
    <RouterProvider router={router} />
    </UserProvider>

  </React.StrictMode>
);
