const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "todoApplication.db");
let db = null;
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Sever is starting at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB Error:${e.message}`);
  }
};

initializeDbAndServer();
//API -1

app.get("/todos/", async (request, response) => {
  const { status, priority, search_q = "" } = request.query;
  if (status != undefined && priority != undefined) {
    const statusPriorityQuery = `SELECT *
                                   FROM todo
                                   WHERE (status='${status}' and priority='${priority}' and todo LIKE '%${search_q}%');`;
    const statusPriority = await db.all(statusPriorityQuery);

    response.send(statusPriority);
  } else if (status != undefined && priority == undefined) {
    const statusTodoQuery = `SELECT *
                                   FROM todo
                                   WHERE (status='${status}' and todo LIKE '%${search_q}%') ;`;
    const statusTodo = await db.all(statusTodoQuery);
    response.send(statusTodo);
  } else if (priority != undefined) {
    const priorityTodoQuery = `SELECT *
                                   FROM todo
                                   WHERE (priority='${priority}' and todo LIKE '%${search_q}%');`;
    const priorityTodo = await db.all(priorityTodoQuery);
    response.send(priorityTodo);
  } else {
    const searchTodoQuery = `SELECT *
                                  FROM todo
                                  WHERE todo LIKE '%${search_q}%';`;
    const searchTodo = await db.all(searchTodoQuery);
    response.send(searchTodo);
  }
});

//API 2

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQueryWithId = `SELECT *
                                   FROM todo
                                   WHERE id= ${todoId};`;
  const getTodoWithId = await db.get(getTodoQueryWithId);
  response.send(getTodoWithId);
});

//API 3

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const createTodoQuery = `INSERT INTO todo(id,todo,priority,status)
                                VALUES(${id},'${todo}','${priority}','${status}')
                                `;
  const createTodo = await db.run(createTodoQuery);
  response.send("Todo Successfully Added");
});

//API 4

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { status, priority, todo } = request.body;
  if (status != undefined) {
    const updateStatusQuery = `UPDATE todo 
                                SET status='${status}'
                                WHERE id = ${todoId};`;
    const updateStatus = await db.run(updateStatusQuery);
    response.send("Status Updated");
  } else if (priority != undefined) {
    const updatePriorityQuery = `UPDATE todo 
                                SET priority='${priority}'
                                WHERE id = ${todoId};`;
    const priorityStatus = await db.run(updatePriorityQuery);
    response.send("Priority Updated");
  } else if (todo != undefined) {
    const updateTodoQuery = `UPDATE todo 
                                SET todo='${todo}'
                                WHERE id = ${todoId};`;
    const updateTodo = await db.run(updateTodoQuery);
    response.send("Todo Updated");
  }
});

//API 5

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `DELETE FROM todo
                                WHERE id= ${todoId}`;
  const deleteTodo = await db.run(deleteTodoQuery);
  response.send("Todo Deleted");
});

module.exports = app;
