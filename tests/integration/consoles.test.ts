import app from "../../src/app"
import httpStatus from "http-status"
import supertest from "supertest"
import { cleanDb } from "../helpers"
import createConsole from "../factories/console-factory"
import { faker } from "@faker-js/faker"
import prisma  from "../../src/config/database";

beforeAll(async () => {
  await cleanDb();
})

beforeEach(async () => {
  await cleanDb()
})

afterAll(async () => {
  await cleanDb()
})

const server = supertest(app)

describe("GET /consoles", () => {
  it("should respond with status 200 and consoles data", async () => {
    await createConsole()
    const response = await server.get("/consoles")
    expect(response.body.length).toBe(1)
  })
})

describe("GET /consoles/:id", () => {
  it("should respond with status 404 if console id is invalid", async () => {
    const response = await server.get("/consoles/0")

    expect(response.status).toBe(httpStatus.NOT_FOUND)
  })

  it("should respond with status 200 and console data", async () => {
    const createdConsole = await createConsole()
    const response = await server.get(`/consoles/${createdConsole.id}`)

    expect(response.body).toEqual(createdConsole)
  })
})

describe("POST /consoles", () => {
  it("should respond with status 422 if body is invalid", async () => {
    const response = await server.post("/consoles").send({
      name: faker.datatype.number() 
    })

    expect(response.status).toBe(httpStatus.UNPROCESSABLE_ENTITY)
  })

  it("should respond with status 409 if console title is already registered", async () => {
    const createdConsole = await createConsole()
    const response = await server.post("/consoles").send({
      name: createdConsole.name
    })

    expect(response.status).toBe(httpStatus.CONFLICT)
  })

  it("should respond with status 201 and create a console", async () => {
    const beforeCount = await prisma.console.count()
    const response = await server.post("/consoles").send({
      name: faker.name.fullName(),
    })
    const afterCount = await prisma.console.count()

    expect(beforeCount).toEqual(0)
    expect(afterCount).toEqual(1)
    expect(response.status).toBe(httpStatus.CREATED)
  })
})