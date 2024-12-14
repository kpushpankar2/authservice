import request from "supertest";
import app from "../../src/app";
import { User } from "../../src/entity/User";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import { Roles } from "../../src/constants";
import { isJWT } from "../utils";
import { RefreshToken } from "../../src/entity/RefreshToken";

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

                password: "secrettt",
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

                password: "secrettt",
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

                password: "secrettt",
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

        it("should return an id of the created user", async () => {
            // Arrange
            const userData = {
                firstName: "Pushpankar",

                lastName: "Singh",

                email: "kpushpankar3@gmail.com",

                password: "secrettt",
            };
            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            // Assert
            expect(response.body).toHaveProperty("id");
            const repository = connection.getRepository(User);
            const users = await repository.find();
            expect((response.body as Record<string, string>).id).toBe(
                users[0].id,
            );
        });

        it("should assign a customer role", async () => {
            //Arrange

            const userData = {
                firstName: "Pushpankar",

                lastName: "Singh",

                email: "kpushpankar3@gmail.com",

                password: "secrettt",
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

                password: "secrettt",
            };

            // Act

            await request(app).post("/auth/register").send(userData);

            // Assert

            const userRepository = connection.getRepository(User);

            const users = await userRepository.find({ select: ["password"] });

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

        it("should return the access token and refresh token inside a cookie", async () => {
            //Arrange

            const userData = {
                firstName: "Pushpankar",

                lastName: "Singh",

                email: "kpushpankar3@gmail.com",

                password: "secrettt",
            };

            // Act

            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            // Assert

            interface Headers {
                ["set-cookie"]: string[];
            }

            let accessToken: string | null = null;
            let refreshToken: string | null = null;

            const cookies =
                (response.headers as unknown as Headers)["set-cookie"] || [];

            cookies.forEach((cookie) => {
                if (cookie.startsWith("accessToken=")) {
                    accessToken = cookie.split(";")[0].split("=")[1];
                }

                if (cookie.startsWith("refreshToken=")) {
                    refreshToken = cookie.split(";")[0].split("=")[1];
                }
            });

            expect(accessToken).not.toBeNull();
            expect(refreshToken).not.toBeNull();

            //  console.log(accessToken);
            expect(isJWT(accessToken)).toBeTruthy();

            expect(isJWT(refreshToken)).toBeTruthy();
        });

        it("should store the refresh token in the database", async () => {
            const userData = {
                firstName: "Pushpankar",

                lastName: "Singh",

                email: "kpushpankar3@gmail.com",

                password: "secrettt",
            };

            // Act

            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            // Assert

            const refreshTokenRepo = connection.getRepository(RefreshToken);

            // const refreshTokens = await refreshTokenRepo.find(

            // );

            // expect(refreshTokens).toHaveLength(1);

            const tokens = await refreshTokenRepo
                .createQueryBuilder("refreshToken")
                .where("refreshToken.userId= :userId", {
                    userId: (response.body as Record<string, string>).id,
                })
                .getMany();

            expect(tokens).toHaveLength(1);
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

        it("should return 400 satus code if first_name is missing ", async () => {
            const userData = {
                firstName: "",

                lastName: "Singh",

                email: "kpushpankar3@gmail.com",

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

        it("should return 400 satus code if last_name is missing ", async () => {
            const userData = {
                firstName: "Pushpankar",

                lastName: "",

                email: "kpushpankar3@gmail.com",

                password: "secrettt",
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

        it("should return 400 status code if password is missing", async () => {
            // Arrange
            const userData = {
                firstName: "Pushpankar",

                lastName: "Singh",

                email: "kpushpankar3@gmail.com",

                password: "",
            };
            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            // Assert
            expect(response.statusCode).toBe(400);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(0);
        });
    });

    describe("fields are not in proper format", () => {
        it("should trim the email field", async () => {
            //Arrange

            const userData = {
                firstName: "Pushpankar",

                lastName: "Singh",

                email: " kpushpankar3@gmail.com  ",

                password: "secrettt",
            };

            await request(app).post("/auth/register").send(userData);

            const userRepository = connection.getRepository(User);

            const users = await userRepository.find();

            const user = users[0];

            expect(user.email).toBe("kpushpankar3@gmail.com");

            //Asert
        });

        it("should return 400 status code if email is not a valid email", async () => {
            // Arrange
            const userData = {
                firstName: "Pushpankar",

                lastName: "Singh",

                email: " kpushpankar_gmail.pushpa  ",

                password: "secrettt",
            };

            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            // Assert
            expect(response.statusCode).toBe(400);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(0);
        });

        it("should return 400 status code if password length is less than 8 chars", async () => {
            //Arrange

            const userData = {
                firstName: "Pushpankar",

                lastName: "Singh",

                email: " kpushpankar3@gmail.com  ",

                password: "secret",
            };

            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            // Assert
            expect(response.statusCode).toBe(400);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(0);
        });

        it("shoud return an array of error messages if email is missing", async () => {
            // Arrange
            const userData = {
                firstName: "Pushpankar",

                lastName: "Singh",

                email: "",

                password: "secret",
            };
            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            // Assert
            expect(response.body).toHaveProperty("errors");
            expect(
                (response.body as Record<string, string>).errors.length,
            ).toBeGreaterThan(0);
        });
    });
});
