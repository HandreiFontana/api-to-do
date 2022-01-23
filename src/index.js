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
        return response.status(401).json({ Error: "User not exists" })
    };

    request.user = user;

    return next();
}

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
        todos: []
    };

    users.push(createdUser);

    return response.status(201).send(createdUser)
});

app.get("/todos", checkExistsUserAccount, (request, response) => {
    const { user } = request;

    return response.json(user.todos);
});

app.post("/todos", checkExistsUserAccount, (request, response) => {
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

app.put("/todos/:id", checkExistsUserAccount, (request, response) => {
    const { user } = request;

    const { title, deadline } = request.body;

    const { id } = request.params;

    const findToDoWithId = user.todos.find((todo) => todo.id === id);

    if(!findToDoWithId) {
        return response.status(404).json({ Error: "Id not found" })
    };

    findToDoWithId.title = title;
    findToDoWithId.deadline = new Date(deadline);

    return response.status(201).send()
});

app.patch("/todos/:id/done", checkExistsUserAccount, (request, response) => {
    const { user } = request;

    const { id } = request.params;

    const findToDoWithId = user.todos.find((todo) => todo.id === id);

    if(!findToDoWithId) {
        return response.status(404).json({ Error: "Id not found" })
    };

    findToDoWithId.done = true;

    return response.status(201).send()
});

app.delete("/todos/:id", checkExistsUserAccount, (request, response) => {
    const { user } = request;

    const { id } = request.params;

    const findToDoWithId = user.todos.find((todo) => todo.id === id);

    if(!findToDoWithId) {
        return response.status(404).json({ Error: "Id not found" })
    };

    user.todos.splice(findToDoWithId, 1)

    return response.status(204).send()
})

app.listen(9090);