const {
    client,
    createTables,
    createUser,
    createSkill,
    fetchUsers,
    fetchSkills,
    createUserSkill,
    fetchUserSkills,
    deleteUserSkill,
    authenticate,
    findUserByToken,
} = require("./db");
const express = require("express");
const dotenv = require("dotenv").config();
const app = express();
app.use(express.json());

//for deployment only
const path = require("path");
app.get("/", (req, res) =>
    res.sendFile(path.join(__dirname, "../client/dist/index.html"))
);
app.use(
    "/assets",
    express.static(path.join(__dirname, "../client/dist/assets"))
);

const isLoggedIn = async (req, res, next) => {
    try {
        req.user = await findUserByToken(req.headers.authorization);
        next();
    } catch (ex) {
        next(ex);
    }
};

app.post("/signup", async (req, res, next) => {
    try {
        const { username, password } = req.body;

        const newUser = await createUser({ username, password });

        res.status(201).send(newUser);
    } catch (error) {
        next(error);
    }
});

app.post("/api/auth/login", async (req, res, next) => {
    try {
        res.send(await authenticate(req.body));
    } catch (ex) {
        next(ex);
    }
});

app.get("/api/auth/me", isLoggedIn, async (req, res, next) => {
    try {
        res.send(req.user);
    } catch (ex) {
        next(ex);
    }
});

app.get("/api/skills", async (req, res, next) => {
    try {
        res.send(await fetchSkills());
    } catch (ex) {
        next(ex);
    }
});

app.get("/api/users", async (req, res, next) => {
    try {
        res.send(await fetchUsers());
    } catch (ex) {
        next(ex);
    }
});

app.get("/api/users/:id/userSkills", isLoggedIn, async (req, res, next) => {
    try {
        if (req.params.id !== req.user.id) {
            const error = Error("not authorized");
            error.status = 401;
            throw error;
        }
        res.send(await fetchUserSkills(req.params.id));
    } catch (ex) {
        next(ex);
    }
});

app.delete(
    "/api/users/:userId/userSkills/:id",
    isLoggedIn,
    async (req, res, next) => {
        try {
            if (req.params.userId !== req.user.id) {
                const error = Error("not authorized");
                error.status = 401;
                throw error;
            }
            await deleteUserSkill({
                user_id: req.params.userId,
                id: req.params.id,
            });
            res.sendStatus(204);
        } catch (ex) {
            next(ex);
        }
    }
);

app.post("/api/users/:id/userSkills", isLoggedIn, async (req, res, next) => {
    try {
        if (req.params.id !== req.user.id) {
            const error = Error("not authorized");
            error.status = 401;
            throw error;
        }
        res.status(201).send(
            await createUserSkill({
                user_id: req.params.id,
                skill_id: req.body.skill_id,
            })
        );
    } catch (ex) {
        next(ex);
    }
});

app.use((err, req, res, next) => {
    console.log(err);
    res.status(err.status || 500).send({ error: err.message || err });
});

const init = async () => {
    console.log("connecting to database");
    await client.connect();
    console.log("connected to database");
    // await createTables();
    // console.log("tables created");
    // const [moe, lucy, larry, ethyl, dancing, singing, plateSpinning, juggling] =
    //     await Promise.all([
    //         createUser({ username: "moe", password: "moe_pw" }),
    //         createUser({ username: "lucy", password: "lucy_pw" }),
    //         createUser({ username: "larry", password: "larry_pw" }),
    //         createUser({ username: "ethyl", password: "ethyl_pw" }),
    //         createSkill({ name: "dancing" }),
    //         createSkill({ name: "singing" }),
    //         createSkill({ name: "plate spinning" }),
    //         createSkill({ name: "juggling" }),
    //     ]);

    // console.log(await fetchUsers());
    // console.log(await fetchSkills());

    // const userSkills = await Promise.all([
    //     createUserSkill({ user_id: moe.id, skill_id: plateSpinning.id }),
    //     createUserSkill({ user_id: ethyl.id, skill_id: juggling.id }),
    // ]);
    // console.log(await fetchUserSkills(moe.id));
    // await deleteUserSkill({ user_id: moe.id, id: userSkills[0].id });
    // console.log(await fetchUserSkills(moe.id));

    // console.log("data seeded");

    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`listening on port ${port}`));
};
init();
