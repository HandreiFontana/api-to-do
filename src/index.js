const express = require("express");
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(express.json())

const users = [];

// Middlewares
function checkExistsUserAccount(request, response, next) {
    const { username } = request.headers;

    const user = users.find(user => user.username === username);

    if (!user) {
        return response.status(404).json({ Error: "User not exists" })
    };

    request.user = user;

    return next();
}

function checkCreateTodosUserAvailability(request, response, next) {
    const { user } = request;

    if (user.premiumPlan === false && user.todos.length == 10) {
        return response.status(403).json({ Error: "Todo list is full. Please adquire our Premium Plan" })
    };

    return next()
}

function checkTodoExists(request, response, next) {
    const { username } = request.headers;

    const { id } = request.params;

    const findUserWithUsername = users.find(user => user.username === username);
    if (!findUserWithUsername) {
        return response.status(404).json({ Error: "User not exists" })
    };

    const todoIsFromUser = findUserWithUsername.todos.find(todo => todo.id === id);
    if (!todoIsFromUser) {
        return response.status(404).json({ Error: "To do not found" })
    }

    request.user = findUserWithUsername;
    request.todo = todoIsFromUser;

    return next();
}

// Operators
app.post("/users", (request, response) => {
    const { name, username } = request.body;

    const usernameAlreadyExists = users.some((user) => user.username === username)

    if (usernameAlreadyExists) {
        return response.status(400).json({ Error: "Username already exists." })
    }

    const createdUser = {
        id: uuidv4(),
        name,
        username,
        premiumPlan: false,
        todos: [],
    };

    users.push(createdUser);

    return response.status(201).send(createdUser)
});

app.get("/todos", checkExistsUserAccount, (request, response) => {
    const { user } = request;

    return response.json(user.todos);
});

app.post("/todos", checkExistsUserAccount, checkCreateTodosUserAvailability, (request, response) => {
    const { user } = request;

    const { title, deadline } = request.body;

    const todo = {
        id: uuidv4(),
        title,
        done: false,
        deadline: new Date(deadline),
        created_at: new Date(),
    }

    user.todos.push(todo);

    return response.status(201).send(todo)
});

app.put("/todos/:id", checkTodoExists, (request, response) => {
    const { todo } = request;

    const { title, deadline } = request.body;

    todo.title = title;
    todo.deadline = new Date(deadline);

    return response.status(201).send()
});

app.patch("/todos/:id/done", checkTodoExists, (request, response) => {
    const { todo } = request;

    todo.done = true;

    return response.status(201).send()
});

app.delete("/todos/:id", checkTodoExists, (request, response) => {
    const { user, todo } = request;

    const indexOfTodo = user.todos.indexOf(todo); // Única forma de fazer funcionar.

    user.todos.splice(indexOfTodo, 1)

    return response.status(204).send()
})

// Server
app.listen(9090);