import request from "supertest";
import app from "../../src/app";
import { User } from "../../src/entity/User";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import { Roles } from "../../src/constants";

describe("POST /auth/register", () => {
    let connection: DataSource;

    beforeAll(async () => {
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        await connection.dropDatabase();

        await connection.synchronize();
    });

    afterAll(async () => {
        await connection.destroy();
    });

    describe("Given all fields", () => {
        it("it should retun the 201 status code", async () => {
            // AAA

            //Arrange

            const userData = {
                firstName: "Pushpankar",

                lastName: "Singh",

                email: "kpushpankar3@gmail.com",

                password: "secret",
            };

            // Act

            const response = await request(app)
                .post("/auth/register")

                .send(userData);

            // Assert

            expect(response.statusCode).toBe(201);
        });

        it("should return valid json response", async () => {
            const userData = {
                firstName: "Pushpankar",

                lastName: "Singh",

                email: "kpushpankar3@gmail.com",

                password: "secret",
            };

            // Act

            const response = await request(app)
                .post("/auth/register")

                .send(userData);

            // Assert

            expect(
                (response.headers as Record<string, string>)["content-type"],
            ).toEqual(expect.stringContaining("json"));
        });

        it("should persit the user in the database", async () => {
            const userData = {
                firstName: "Pushpankar",

                lastName: "Singh",

                email: "kpushpankar3@gmail.com",

                password: "secret",
            };

            // Act

            await request(app).post("/auth/register").send(userData);

            // Asert

            const userRepository = connection.getRepository(User);

            const users = await userRepository.find();

            expect(users).toHaveLength(1);

            expect(users[0].firstName).toBe(userData.firstName);

            expect(users[0].lastName).toBe(userData.lastName);

            expect(users[0].email).toBe(userData.email);

            expect(users[0].password).not.toBe(userData.password);
        });

        it("should assign a customer role", async () => {
            //Arrange

            const userData = {
                firstName: "Pushpankar",

                lastName: "Singh",

                email: "kpushpankar3@gmail.com",

                password: "secret",
            };

            // Act

            await request(app).post("/auth/register").send(userData);

            const userRepository = connection.getRepository(User);

            const users = await userRepository.find();

            expect(users[0]).toHaveProperty("role");

            expect(users[0].role).toBe(Roles.CUSTOMER);
        });

        it("should store the hashed password in the database", async () => {
            //Arrange

            const userData = {
                firstName: "Pushpankar",

                lastName: "Singh",

                email: "kpushpankar3@gmail.com",

                password: "secret",
            };

            // Act

            await request(app).post("/auth/register").send(userData);

            // Assert

            const userRepository = connection.getRepository(User);

            const users = await userRepository.find();

            expect(users[0].password).not.toBe(userData.password);

            expect(users[0].password).toHaveLength(60);

            expect(users[0].password).toMatch(/^\$2b\$\d+\$/);
        });

        it("should return 400 status code if email is already exist", async () => {
            //Arrange

            const userData = {
                firstName: "Pushpankar",

                lastName: "Singh",

                email: "kpushpankar3@gmail.com",

                password: "secret",
            };

            // Act

            const userRepository = connection.getRepository(User);

            await userRepository.save({ ...userData, role: Roles.CUSTOMER });

            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            await request(app).post("/auth/register").send(userData);

            const users = await userRepository.find();

            expect(response.statusCode).toBe(400);

            expect(users).toHaveLength(1);

            // Assert
        });
    });

    describe("Fields are missing", () => {
        it("should return 400 status code if email field is missing", async () => {
            //Arrange

            const userData = {
                firstName: "Pushpankar",

                lastName: "Singh",

                email: "",

                password: "secret",
            };

            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            //Asert

            expect(response.statusCode).toBe(400);

            const userRepository = connection.getRepository(User);

            const users = await userRepository.find();

            expect(users).toHaveLength(0);
        });
    });
});
