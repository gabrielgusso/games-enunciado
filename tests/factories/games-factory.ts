import prisma  from "../../src/config/database";
import { faker } from "@faker-js/faker"

export default async function createGame(consoleId: number){
    return await prisma.game.create({
        data: {
            title: faker.name.fullName(),
            consoleId
        }
    })
}
