const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Item = require("../models/Item");
const Claim = require("../models/Claim");
const authRoutes = require("../routes/authRoutes");
const itemRoutes = require("../routes/itemRoutes");
const claimRoutes = require("../routes/claimRoutes");

const ownerId = "000000000000000000000001";
const claimantId = "000000000000000000000002";
const itemId = "000000000000000000000003";
const claimId = "000000000000000000000004";
const originalSecret = process.env.JWT_SECRET;
let token;

// This suite never loads .env or connects to MongoDB. All model calls are mocked.
before(() => {
  process.env.JWT_SECRET = "test-only-secret-never-used-for-real-accounts";
  token = jwt.sign({ userId: claimantId }, process.env.JWT_SECRET);
});

after(() => {
  if (originalSecret === undefined) delete process.env.JWT_SECRET;
  else process.env.JWT_SECRET = originalSecret;
});

function query(value, onPopulate = () => {}) {
  return {
    populate(field, selection) { onPopulate(field, selection); return this; },
    sort() { return this; },
    select() { return this; },
    then(resolve, reject) { return Promise.resolve(value).then(resolve, reject); },
  };
}

function authenticate(t, id = claimantId) {
  token = jwt.sign({ userId: id }, process.env.JWT_SECRET);
  t.mock.method(User, "findById", async () => ({ _id: id, role: "user", isActive: true }));
}

function mockItemLookup(t, item, onPopulate) {
  t.mock.method(Item, "findOne", filter => {
    const matches = item && Object.entries(filter).every(([key, value]) => item[key] === value);
    return query(matches ? item : null, onPopulate);
  });
}

async function request(path, { method = "GET", body, authenticated = false } = {}) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (authenticated) headers.authorization = `Bearer ${token}`;
  const [prefix, router] = [
    ["/auth", authRoutes], ["/items", itemRoutes], ["/claims", claimRoutes],
  ].find(([prefix]) => path === prefix || path.startsWith(`${prefix}/`));
  // Exercise the actual Express routers and middleware in process, without
  // opening sockets or requiring network access in restricted environments.
  return new Promise((resolve, reject) => {
    const req = { method, url: path.slice(prefix.length) || "/", headers, body, query: {} };
    const res = {
      statusCode: 200,
      status(code) { this.statusCode = code; return this; },
      json(value) {
        resolve({ status: this.statusCode, body: JSON.parse(JSON.stringify(value)) });
        return this;
      },
    };
    router.handle(req, res, error => reject(error || new Error(`Unhandled test route: ${method} ${path}`)));
  });
}

test("old password-reset requests cannot read or change an account", async t => {
  const lookup = t.mock.method(User, "findOne", () => { throw new Error("Recovery must not access accounts"); });
  const update = t.mock.method(User, "findByIdAndUpdate", () => { throw new Error("Recovery must not change accounts"); });
  for (const body of [{ email: "student@example.invalid", studentId: "TEST0001", newPassword: "new-password" }, {}]) {
    const result = await request("/auth/reset-password", { method: "POST", body });
    assert.equal(result.status, 403);
    assert.equal(result.body.success, false);
    assert.match(result.body.message, /unavailable/i);
  }
  assert.equal(lookup.mock.callCount(), 0);
  assert.equal(update.mock.callCount(), 0);
});

for (const approvalStatus of ["pending", "rejected"]) {
  for (const suffix of ["", "/matches"]) {
    test(`${approvalStatus} item cannot be read publicly at details${suffix || " endpoint"}`, async t => {
      mockItemLookup(t, { _id: itemId, approvalStatus, owner: ownerId });
      const candidates = t.mock.method(Item, "find", () => { throw new Error("Hidden item must not be matched"); });
      const result = await request(`/items/${itemId}${suffix}`);
      assert.equal(result.status, 404);
      assert.equal(result.body.item, undefined);
      assert.equal(result.body.sourceItem, undefined);
      assert.equal(candidates.mock.callCount(), 0);
    });
  }

  test(`${approvalStatus} item cannot receive a new claim`, async t => {
    authenticate(t);
    mockItemLookup(t, { _id: itemId, approvalStatus, status: "open", owner: ownerId });
    const create = t.mock.method(Claim, "create", () => { throw new Error("Must not create a claim"); });
    const result = await request("/claims", {
      method: "POST", authenticated: true,
      body: { itemId, message: "This is my lost item", proofDetails: "A distinguishing mark" },
    });
    assert.equal(result.status, 404);
    assert.equal(create.mock.callCount(), 0);
  });
}

test("approved item details remain public without exposing email or student ID", async t => {
  const item = { _id: itemId, approvalStatus: "approved", owner: { _id: ownerId, name: "Student", faculty: "Computing" } };
  const selections = [];
  mockItemLookup(t, item, (field, selection) => selections.push({ field, selection }));
  const result = await request(`/items/${itemId}`);
  assert.equal(result.status, 200);
  assert.equal(result.body.item.owner.name, "Student");
  assert.equal(result.body.item.owner.email, undefined);
  assert.equal(result.body.item.owner.studentId, undefined);
  assert.equal(selections.length, 1);
  assert.equal(selections[0].field, "owner");
  assert.deepEqual(selections[0].selection.split(/\s+/).sort(), ["faculty", "name"]);
});

test("public listing selects only name and faculty for item owners", async t => {
  const selections = [];
  t.mock.method(Item, "find", filter => {
    assert.equal(filter.approvalStatus, "approved");
    return query([], (field, selection) => selections.push({ field, selection }));
  });
  const result = await request("/items");
  assert.equal(result.status, 200);
  assert.deepEqual(selections, [{ field: "owner", selection: "name faculty" }]);
});

test("approved item matching remains available and keeps owner identifiers private", async t => {
  const source = { _id: itemId, approvalStatus: "approved", status: "open", owner: ownerId, type: "lost", title: "Blue bag", description: "A small blue bag", location: "Library", category: "Bags", incidentDate: "2026-10-18" };
  mockItemLookup(t, source);
  const selections = [];
  t.mock.method(Item, "find", filter => {
    assert.equal(filter.approvalStatus, "approved");
    assert.equal(filter.type, "found");
    return query([{ ...source, _id: "000000000000000000000005", type: "found" }], (field, selection) => selections.push({ field, selection }));
  });
  const result = await request(`/items/${itemId}/matches`);
  assert.equal(result.status, 200);
  assert.equal(result.body.matches.length, 1);
  assert.deepEqual(selections, [{ field: "owner", selection: "name faculty" }]);
});

test("approved items still accept claims from another logged-in user", async t => {
  authenticate(t);
  mockItemLookup(t, { _id: itemId, approvalStatus: "approved", status: "open", owner: ownerId });
  t.mock.method(Claim, "findOne", async () => null);
  const create = t.mock.method(Claim, "create", async data => ({ _id: claimId, ...data }));
  t.mock.method(Claim, "findById", () => query({ _id: claimId, status: "pending" }));
  const result = await request("/claims", {
    method: "POST", authenticated: true,
    body: { itemId, message: "This is my lost item", proofDetails: "A distinguishing mark" },
  });
  assert.equal(result.status, 201);
  assert.equal(create.mock.callCount(), 1);
});

test("item owners still cannot claim their own report", async t => {
  authenticate(t, ownerId);
  mockItemLookup(t, { _id: itemId, approvalStatus: "approved", status: "open", owner: ownerId });
  const result = await request("/claims", {
    method: "POST", authenticated: true,
    body: { itemId, message: "This is my lost item", proofDetails: "A distinguishing mark" },
  });
  assert.equal(result.status, 400);
  assert.match(result.body.message, /own item/i);
});

for (const approvalStatus of ["pending", "rejected", null]) {
  test(`claim review cannot act on ${approvalStatus || "deleted"} items`, async t => {
    authenticate(t, ownerId);
    const save = t.mock.fn(async () => {});
    const claim = { _id: claimId, status: "pending", item: approvalStatus ? { _id: itemId, owner: ownerId, approvalStatus } : null, save };
    t.mock.method(Claim, "findById", () => query(claim));
    const result = await request(`/claims/${claimId}/review`, { method: "PUT", authenticated: true, body: { status: "approved" } });
    assert.equal(result.status, 404);
    assert.equal(save.mock.callCount(), 0);
  });
}

test("an item owner can still reject a pending claim on an approved item", async t => {
  authenticate(t, ownerId);
  const save = t.mock.fn(async () => {});
  const claim = { _id: claimId, status: "pending", item: { _id: itemId, owner: ownerId, approvalStatus: "approved" }, save };
  t.mock.method(Claim, "findById", () => query(claim));
  const result = await request(`/claims/${claimId}/review`, { method: "PUT", authenticated: true, body: { status: "rejected" } });
  assert.equal(result.status, 200);
  assert.equal(save.mock.callCount(), 1);
  assert.equal(claim.status, "rejected");
});

test("normal login still returns a token and user.id", async t => {
  const password = "Review-only-password";
  const passwordHash = await bcrypt.hash(password, 4);
  t.mock.method(User, "findOne", () => query({ _id: ownerId, email: "student@example.invalid", password: passwordHash, isActive: true, role: "user" }));
  const result = await request("/auth/login", { method: "POST", body: { email: "student@example.invalid", password } });
  assert.equal(result.status, 200);
  assert.equal(result.body.user.id, ownerId);
  assert.equal(jwt.verify(result.body.token, process.env.JWT_SECRET).userId, ownerId);
});
