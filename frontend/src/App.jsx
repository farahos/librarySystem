import React from 'react';
import Sidebar from './components/Sidebar';
import { Outlet } from 'react-router-dom';
import Post from './components/Post';
import PostsList from './components/PostsList';
import EditPost from './components/EditPost';

const App = () => {
  return (
    <div>
      {/* <Post />
      <PostsList />
      <EditPost /> */}
      <Sidebar />
      <Outlet />


    </div>

  );
};

export default App;
