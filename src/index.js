const express = require("express");
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(express.json())

const users = [];

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

app.listen(9090);