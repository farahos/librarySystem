import React from 'react';
import Sidebar from './components/Sidebar';
import { Outlet } from 'react-router-dom';
import Post from './components/Post';
import PostsList from './components/PostsList';

const App = () => {
  return (
    <div>
      <Post />
      <PostsList />
    </div>

  );
};

export default App;
