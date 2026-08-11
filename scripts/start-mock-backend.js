const jsonServer = require("json-server");
const server = jsonServer.create();
const router = jsonServer.router({
  users: [{ id: "demo-user", username: "demo-user", password: "password123", cities: [] }],
  alerts: []
});
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.bodyParser);

server.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;
  const user = router.db.get("users").find({ username }).value();
  if (user && password === "password123") {
    return res.jsonp({ token: `token-${username}` });
  }
  res.status(401).jsonp({ error: "Invalid credentials" });
});

server.post("/api/alerts", (req, res) => {
  const alert = { id: `alert-${Date.now()}`, ...req.body };
  router.db.get("alerts").push(alert).write();
  res.status(201).jsonp(alert);
});

server.get("/api/users/:id/cities", (req, res) => {
  const user = router.db.get("users").find({ id: req.params.id }).value();
  if (!user) {
    return res.status(404).jsonp({ error: "User not found" });
  }
  res.jsonp(user.cities || []);
});

server.post("/api/users/:id/cities", (req, res) => {
  const user = router.db.get("users").find({ id: req.params.id }).value();
  if (!user) {
    return res.status(404).jsonp({ error: "User not found" });
  }
  const city = { id: `city-${Date.now()}`, ...req.body };
  router.db.get("users").find({ id: req.params.id }).get("cities").push(city).write();
  res.status(201).jsonp(city);
});

server.post("/api/testing/clear", (req, res) => {
  router.db.set("alerts", []).write();
  router.db.get("users").forEach(u => u.cities = []).write();
  res.jsonp({ ok: true });
});

server.use("/api", router);
const port = process.env.MOCK_API_PORT || 4000;
server.listen(port, () => {
  console.log(`Mock API running on http://localhost:${port}/api`);
});
