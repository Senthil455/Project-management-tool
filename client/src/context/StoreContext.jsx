import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../api/client.js';

const StoreContext = createContext(null);

export const StoreProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);

  const loadUsers = useCallback(async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data.users);
    } catch (err) {
      /* handled by interceptor */
    } finally {
      setUsersLoading(false);
    }
  }, []);

  const loadProjects = useCallback(async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data.projects);
    } catch (err) {
      /* handled by interceptor */
    } finally {
      setProjectsLoading(false);
    }
