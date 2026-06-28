import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthProvider';
import API from '../services/api';

function Dashboard() {
  const { user, setUser } = useContext(AuthContext);

  const [boards, setBoards] = useState([]);
  const [title, setTitle] = useState('');

  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);

  async function fetchBoards() {
    try {
      const { data } = await API.get('/boards', {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      setBoards(data);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    fetchBoards();
  }, [user]);

  const createBoard = async () => {
    if (!title.trim()) {
      alert('Please enter board title');
      return;
    }

    try {
      await API.post(
        '/boards',
        { title },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      setTitle('');
      fetchBoards();
    } catch (error) {
      console.log(error);
    }
  };

  const renameBoard = async (id, title) => {
    try {
      await API.put(
        `/boards/${id}`,
        { title },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      fetchBoards();
    } catch (error) {
      console.log(error);
    }
  };

  const deleteBoard = async (id) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this board?'
    );

    if (!confirmDelete) return;

    try {
      await API.delete(`/boards/${id}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      fetchBoards();
    } catch (error) {
      console.log(error);
    }
  };

  const logoutHandler = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  return (
    <div
      className={`min-h-screen p-10 ${
        darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'
      }`}
    >
      {' '}
      <div className="flex justify-between items-center mb-8">
        {' '}
        <h1 className="text-3xl font-bold">Welcome, {user?.name}</h1>
        
        <div className="flex gap-3">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="bg-gray-800 text-white px-4 py-2 rounded"
          >
            {darkMode ? '☀️ Light' : '🌙 Dark'}
          </button>

          <button
            onClick={logoutHandler}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>
      </div>
      <div className="bg-white p-5 rounded shadow mb-8">
        <h2 className="text-xl font-bold mb-4">Create Board</h2>

        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Board Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border p-2 rounded w-full"
          />

          <button
            onClick={createBoard}
            className="bg-blue-500 text-white px-4 rounded"
          >
            Create
          </button>
        </div>
      </div>
      <h2 className="text-2xl font-bold mb-4">Your Boards</h2>
      {boards.length === 0 ? (
        <p>No Boards Found</p>
      ) : (
        boards.map((board) => (
          <div key={board._id} className="bg-white p-5 rounded shadow mb-4">
            <div className="flex justify-between items-center">
              <h3
                onClick={() => navigate(`/board/${board._id}`)}
                className="text-xl font-semibold cursor-pointer"
              >
                {board.title}
              </h3>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const newTitle = prompt(
                      'Enter new board title',
                      board.title
                    );

                    if (!newTitle) return;

                    renameBoard(board._id, newTitle);
                  }}
                  className="bg-yellow-500 text-white px-3 py-1 rounded"
                >
                  Edit
                </button>

                <button
                  onClick={() => deleteBoard(board._id)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default Dashboard;