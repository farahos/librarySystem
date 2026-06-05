
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
import Books from './components/Books.jsx';
import PostDetail from './components/PostDetail.jsx';
import Post from './components/Post.jsx';
import About from './components/About.jsx';
import Contact from './components/Contact.jsx';
import LibraryPage from './components/LibraryPage.jsx';
import MyLibrary from './components/MyLibrary.jsx';
import ChapterReader from './components/ChapterReader.jsx';
import WriterDashboard from './components/WriterDashboard.jsx';
import AdminUsers from './admin/AdminUsers.jsx';
import AdminGenres from './admin/AdminGenres.jsx';
import ModerationQueue from './admin/ModerationQueue.jsx';
import FeatureManager from './admin/FeatureManager.jsx';
import AdminVerification from './admin/AdminVerification.jsx';
import ModerationLogPage from './admin/ModerationLogPage.jsx';
import AddChapter from './components/AddChapter.jsx';
import UserProfile from './components/UserProfile.jsx';
import EditProfile from './components/EditProfile.jsx';
import FollowListPage from './components/FollowListPage.jsx';
import NotificationsPage from './components/NotificationsPage.jsx';
import SettingsPage from './components/SettingsPage.jsx';
import ReadingListsPage from './components/ReadingListsPage.jsx';
import ReadingListDetail from './components/ReadingListDetail.jsx';
import StoryWorkspace from './components/StoryWorkspace.jsx';




const router = createBrowserRouter([
  {
    path: "/", element: <App/>,
    children:[
      
        { path: '/login', 
          element: <Login/> },
            { path: '/Register', 
          element: <Register/> },

        { index: true,
          element: <Home /> },
        { path: '/Home', 
          element: <Home /> },
         { path: '/create', 
          element: <Post /> },
         { path: '/edit/:id', 
          element: <EditPost /> },
          { path: '/Booked', 
          element: <MyLibrary /> },
          { path: '/library',
          element: <MyLibrary /> },
          { path: '/library/bookmarks',
          element: <LibraryPage type="bookmarks" /> },
          { path: '/library/continue-reading',
          element: <LibraryPage type="continue-reading" /> },
          { path: '/library/history',
          element: <LibraryPage type="history" /> },
          { path: '/library/lists',
          element: <ReadingListsPage /> },
          { path: '/reading-lists/:listId',
          element: <ReadingListDetail /> },
          { path: '/read/:storyId/:chapterNumber',
          element: <ChapterReader /> },
          { path: '/story/:storyId/chapters/new',
          element: <AddChapter /> },
          { path: '/story/:storyId/manage',
          element: <StoryWorkspace /> },
          { path: '/profile',
          element: <UserProfile own /> },
          { path: '/profile/edit',
          element: <EditProfile /> },
          { path: '/notifications',
          element: <NotificationsPage /> },
          { path: '/settings',
          element: <SettingsPage /> },
          { path: '/user/:username',
          element: <UserProfile /> },
          { path: '/user/:username/followers',
          element: <FollowListPage type="followers" /> },
          { path: '/user/:username/following',
          element: <FollowListPage type="following" /> },
          { path: '/writer-dashboard',
          element: <WriterDashboard /> },
          { path: '/Books', 
          element: <Books /> },
           { path: '/admin-dashboard', 
          element: <AdminDashboard /> },
           { path: '/admin/users',
          element: <AdminUsers /> },
           { path: '/admin/reports',
          element: <ModerationQueue /> },
           { path: '/admin/featured',
          element: <main className="min-h-screen bg-gray-50 px-4 py-8"><div className="mx-auto max-w-7xl"><FeatureManager /></div></main> },
           { path: '/admin/verification',
          element: <AdminVerification /> },
           { path: '/admin/logs',
          element: <ModerationLogPage /> },
           { path: '/admin/genres',
          element: <AdminGenres /> },
           { path: '/addbook', 
          element: <AddBook /> },
           { path: '/viewbook', 
          element: <ViewBook /> },
           { path: '/story/:slug',
          element: <PostDetail /> },
           { path: '/post/:slug', 
          element: <PostDetail /> },
          { path: '/Contact', 
          element: <Contact /> },
          { path: '/About', 
          element: <About /> },

        

         
    ]
  
  }
])
createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <UserProvider>

    <Toaster
      position="top-center"
      reverseOrder={false}
      toastOptions={{
        duration: 3500,
        style: {
          background: "var(--madal-toast-bg)",
          color: "var(--madal-toast-color)",
          border: "1px solid var(--madal-toast-border)",
          borderRadius: "10px",
          boxShadow: "0 18px 40px rgba(15, 23, 42, 0.18)",
          fontWeight: 700,
        },
        success: {
          iconTheme: {
            primary: "#16a34a",
            secondary: "#ffffff",
          },
        },
        error: {
          iconTheme: {
            primary: "#ef4444",
            secondary: "#ffffff",
          },
        },
      }}
    />
    <RouterProvider router={router} />
    </UserProvider>

  </React.StrictMode>
);
