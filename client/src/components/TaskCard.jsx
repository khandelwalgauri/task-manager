function TaskCard({ task, editTask, deleteTask, updateStatus }) {
  return (
    <div className="bg-white rounded-2xl shadow p-5">
      <h2 className="text-xl font-bold mb-3">{task.title}</h2>

      {task.description && (
        <p className="text-gray-600 mb-3">{task.description}</p>
      )}

      <p className="mb-2">Priority: {task.priority}</p>

      {task.dueDate && (
        <p className="mb-3">
          Due: {new Date(task.dueDate).toLocaleDateString()}
        </p>
      )}

      <select
        value={task.status}
        onChange={(e) => updateStatus(task._id, e.target.value)}
        className="border p-2 rounded w-full mb-4"
      >
        <option>To Do</option>
        <option>In Progress</option>
        <option>Done</option>
      </select>

      <div className="flex gap-2">
        <button
          onClick={() => editTask(task)}
          className="bg-yellow-500 text-white px-4 py-2 rounded"
        >
          Edit
        </button>

        <button
          onClick={() => deleteTask(task._id)}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default TaskCard;
