import request from "supertest";
import app from "../../src/app";

describe("POST /auth/register", () => {
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
        });
    });

    describe("Fields are missing", () => {});
});
