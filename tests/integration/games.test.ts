import app from "../../src/app"
import httpStatus from "http-status"
import supertest from "supertest"
import { cleanDb } from "../helpers"
import createGame from "../factories/games-factory"
import createConsole from "../factories/console-factory"
import { faker } from "@faker-js/faker"
import prisma  from "../../src/config/database";

beforeEach(async () => {
  await cleanDb()
})

const server = supertest(app)

describe("GET /games", () => {
  it("should respond with status 200 and games data", async () => {
    const createdConsole = await createConsole()
    await createGame(createdConsole.id)
    const response = await server.get("/games")

    expect(response.body.length).toBe(1)
  })
})

describe("GET /games/:id", () => {
  it("should respond with status 404 if game id is invalid", async () => {
    const response = await server.get("/games/0")

    expect(response.status).toBe(httpStatus.NOT_FOUND)
  })

  it("should respond with status 200 and game data", async () => {
    const createdConsole = await createConsole()
    const game = await createGame(createdConsole.id)
    const response = await server.get(`/games/${game.id}`)

    expect(response.body).toEqual(game)
  })
})

describe("POST /games", () => {
  it("should respond with status 422 if body is invalid", async () => {
    const response = await server.post("/games").send({
      title: faker.name.fullName() 
    })

    expect(response.status).toBe(httpStatus.UNPROCESSABLE_ENTITY)
  })

  it("should respond with status 409 if game title is already registered", async () => {
    const createdConsole = await createConsole()
    const game = await createGame(createdConsole.id)
    const response = await server.post("/games").send({
      title: game.title,
      consoleId: createdConsole.id
    })

    expect(response.status).toBe(httpStatus.CONFLICT)
  })

  it("should respond with status 409 if console doesnt exist", async () => {
    const response = await server.post("/games").send({
      title: faker.name.fullName() ,
      consoleId: 0
    })

    expect(response.status).toBe(httpStatus.CONFLICT)
  })

  it("should respond with status 201 and create a game", async () => {
    const createdConsole = await createConsole()
    const beforeCount = await prisma.game.count()
    const response = await server.post("/games").send({
      title: faker.name.fullName(),
      consoleId: createdConsole.id
    })
    const afterCount = await prisma.game.count()

    expect(beforeCount).toEqual(0)
    expect(afterCount).toEqual(1)
    expect(response.status).toBe(httpStatus.CREATED)
  })
})