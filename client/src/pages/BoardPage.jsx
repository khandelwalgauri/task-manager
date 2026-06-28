import { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthProvider';
import API from '../services/api';


function BoardPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState('');
  const [estimatedEffort, setEstimatedEffort] = useState('');

  const [filter, setFilter] = useState('All');

  const [aiLoading, setAiLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    fetchTasks();
  }, [user, navigate]);

  async function fetchTasks() {
    try {
      setLoading(true);

      const { data } = await API.get('/tasks', {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      const boardTasks = data.filter((task) => task.board?._id === id);

      setTasks(boardTasks);
    } catch (error) {
      alert('Failed to fetch tasks');
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  const createTask = async () => {
    if (!title.trim()) {
      alert('Enter task title');
      return;
    }

    try {
      await API.post(
        '/tasks',
        {
          title,
          description,
          priority,
          dueDate,
          estimatedEffort,
          board: id,
        },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      setTitle('');
      setDescription('');
      setPriority('Medium');
      setDueDate('');
      setEstimatedEffort('');

      fetchTasks();
    } catch (error) {
      alert('Failed to create task');
    }
  };

  const editTask = async (task) => {
    const newTitle = prompt('Enter new title', task.title);

    if (!newTitle) return;

    try {
      await API.put(
        `/tasks/${task._id}`,
        { title: newTitle },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      fetchTasks();
    } catch (error) {
      alert('Failed to edit task');
    }
  };

  const deleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;

    try {
      await API.delete(`/tasks/${taskId}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      fetchTasks();
    } catch (error) {
      alert('Failed to delete task');
    }
  };

  const updateStatus = async (taskId, status) => {
    try {
      await API.put(
        `/tasks/${taskId}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      fetchTasks();
    } catch (error) {
      alert('Failed to update task');
    }
  };

  const getSuggestion = async () => {
    if (!title.trim()) {
      alert('Please enter task title first');
      return;
    }

    try {
      setAiLoading(true);

      const { data } = await API.post(
        '/ai/suggest',
        {
          title,
          description,
        },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      alert(data.suggestion);
    } catch (error) {
      alert('AI service unavailable');
    } finally {
      setAiLoading(false);
    }
  };

  const renderTasks = (status) => {
    let filteredTasks = tasks.filter((task) => task.status === status);

    if (filter !== 'All') {
      filteredTasks = filteredTasks.filter((task) => task.priority === filter);
    }

    filteredTasks.sort(
      (a, b) => new Date(a.dueDate || 0) - new Date(b.dueDate || 0)
    );

    if (filteredTasks.length === 0) {
      return <p className="text-center text-gray-500 mt-5">No Tasks</p>;
    }

    return filteredTasks.map((task) => (
      <div key={task._id} className="bg-gray-50 rounded-xl shadow p-4 mb-4">
        <h3 className="font-bold text-lg">{task.title}</h3>

        {task.description && (
          <p className="text-gray-600 text-sm mt-2">{task.description}</p>
        )}

        <div className="mt-3">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              task.priority === 'High'
                ? 'bg-red-100 text-red-600'
                : task.priority === 'Medium'
                  ? 'bg-yellow-100 text-yellow-600'
                  : 'bg-green-100 text-green-600'
            }`}
          >
            {task.priority}
          </span>
        </div>

        {task.dueDate && (
          <p className="text-xs text-gray-500 mt-3">
            Due: {new Date(task.dueDate).toLocaleDateString()}
          </p>
        )}

        {task.estimatedEffort && (
          <p className="text-xs text-gray-500 mt-2">
            ⏳ Effort: {task.estimatedEffort}
          </p>
        )}

        {task.dueDate &&
          new Date(task.dueDate) < new Date() &&
          task.status !== 'Done' && (
            <span className="inline-block mt-2 bg-red-100 text-red-600 px-2 py-1 rounded text-xs">
              Overdue
            </span>
          )}

        <div className="flex flex-wrap gap-2 mt-4">
          {status === 'To Do' && (
            <button
              onClick={() => updateStatus(task._id, 'In Progress')}
              className="bg-blue-500 text-white px-3 py-1 rounded"
            >
              Start
            </button>
          )}

          {status === 'In Progress' && (
            <button
              onClick={() => updateStatus(task._id, 'Done')}
              className="bg-green-500 text-white px-3 py-1 rounded"
            >
              Done
            </button>
          )}

          {status === 'Done' && (
            <button
              onClick={() => updateStatus(task._id, 'To Do')}
              className="bg-yellow-500 text-white px-3 py-1 rounded"
            >
              Reopen
            </button>
          )}

          <button
            onClick={() => editTask(task)}
            className="bg-yellow-500 text-white px-3 py-1 rounded"
          >
            Edit
          </button>

          <button
            onClick={() => deleteTask(task._id)}
            className="bg-red-500 text-white px-3 py-1 rounded"
          >
            Delete
          </button>
        </div>
      </div>
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>

          <p className="mt-4 text-lg font-semibold text-gray-600">
            Loading Tasks...
          </p>
        </div>
      </div>
    );
  }

 return (
   <div
     className={`min-h-screen p-8 ${
       darkMode ? 'bg-gray-900 text-white' : 'bg-slate-100'
     }`}
   >
     <div className="max-w-7xl mx-auto">
       <h1 className="text-3xl font-bold text-center mb-8">📌 Board Tasks</h1>
       <div className="flex justify-end mb-5">
         <button
           onClick={() => setDarkMode(!darkMode)}
           className="bg-gray-800 text-white px-4 py-2 rounded"
         >
           {darkMode ? '☀️ Light' : '🌙 Dark'}
         </button>
       </div>

       <div className="bg-white p-6 rounded-xl shadow mb-8">
         <div className="grid gap-4">
           <input
             type="text"
             placeholder="Task Title"
             value={title}
             onChange={(e) => setTitle(e.target.value)}
             className="border p-3 rounded-lg"
           />

           <textarea
             placeholder="Description"
             value={description}
             onChange={(e) => setDescription(e.target.value)}
             className="border p-3 rounded-lg"
             rows="3"
           />

           <div className="grid md:grid-cols-2 gap-4">
             <select
               value={priority}
               onChange={(e) => setPriority(e.target.value)}
               className="border p-3 rounded-lg"
             >
               <option value="Low">Low</option>
               <option value="Medium">Medium</option>
               <option value="High">High</option>
             </select>

             <input
               type="date"
               value={dueDate}
               onChange={(e) => setDueDate(e.target.value)}
               className="border p-3 rounded-lg"
             />
           </div>

           <input
             type="text"
             placeholder="Estimated Effort"
             value={estimatedEffort}
             onChange={(e) => setEstimatedEffort(e.target.value)}
             className="border p-3 rounded-lg"
           />

           <div className="flex gap-4">
             <button
               onClick={getSuggestion}
               className="bg-green-600 text-white p-3 rounded-lg flex-1"
             >
               {aiLoading ? 'Loading...' : 'Suggest Estimate'}
             </button>

             <button
               onClick={createTask}
               className="bg-indigo-600 text-white p-3 rounded-lg flex-1"
             >
               Add Task
             </button>
           </div>
         </div>
       </div>

       <div className="mb-6 flex justify-end">
         <select
           value={filter}
           onChange={(e) => setFilter(e.target.value)}
           className="border p-3 rounded-lg bg-white"
         >
           <option value="All">All Priorities</option>
           <option value="High">High</option>
           <option value="Medium">Medium</option>
           <option value="Low">Low</option>
         </select>
       </div>

       <div className="grid md:grid-cols-3 gap-6">
         <div className="bg-white rounded-xl shadow p-5">
           <h2 className="text-xl font-bold text-yellow-600 text-center mb-5">
             📋 To Do
           </h2>
           {renderTasks('To Do')}
         </div>

         <div className="bg-white rounded-xl shadow p-5">
           <h2 className="text-xl font-bold text-blue-600 text-center mb-5">
             🚀 In Progress
           </h2>
           {renderTasks('In Progress')}
         </div>

         <div className="bg-white rounded-xl shadow p-5">
           <h2 className="text-xl font-bold text-green-600 text-center mb-5">
             ✅ Done
           </h2>
           {renderTasks('Done')}
         </div>
       </div>
     </div>
   </div>
 );
}

export default BoardPage;
