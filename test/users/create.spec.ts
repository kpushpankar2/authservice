import { DataSource } from "typeorm";
// import bcrypt from "bcrypt";
import request from "supertest";
import { AppDataSource } from "../../src/config/data-source";
import app from "../../src/app";
import createJWKSMock from "mock-jwks";
import { Roles } from "../../src/constants";
import { User } from "../../src/entity/User";
import { Tenant } from "../../src/entity/Tenant";
import { createTenant } from "../utils";

// import { isJWT } from "../utils";
// import { User } from "../../src/entity/User";
// import { Roles } from "../../src/constants";

describe("POST /users", () => {
    let connection: DataSource;

    let jwks: ReturnType<typeof createJWKSMock>;

    beforeAll(async () => {
        jwks = createJWKSMock("http://localhost:5501");
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        jwks.start();
        await connection.dropDatabase();
        await connection.synchronize();
    });

    afterEach(() => {
        jwks.stop();
    });

    afterAll(async () => {
        await connection.destroy();
    });

    describe("Given all fields", () => {
        it("should persist the user in the database", async () => {
            const tenant = await createTenant(connection.getRepository(Tenant));
            const adminToken = jwks.token({
                sub: "1",
                role: Roles.ADMIN,
            });

            const userData = {
                firstName: "Pushpankar",

                lastName: "Singh",

                email: "kpushpankar3@gmail.com",

                password: "secrettt",

                tenantId: tenant.id,
                role: Roles.MANAGER,
            };

            //Add Token to cookie

            await request(app)
                .post("/users")
                .set("Cookie", [`accessToken=${adminToken}`])
                .send(userData);
            // Assert
            // Check if user id matches with registered user

            const userRepository = connection.getRepository(User);

            const users = await userRepository.find();

            expect(users).toHaveLength(1);
            expect(users[0].email).toBe(userData.email);
        });

        it("should create a manager user", async () => {
            const tenant = await createTenant(connection.getRepository(Tenant));
            const adminToken = jwks.token({
                sub: "1",
                role: Roles.ADMIN,
            });

            const userData = {
                firstName: "Pushpankar",

                lastName: "Singh",

                email: "kpushpankar3@gmail.com",

                password: "secrettt",

                tenantId: tenant.id,
                role: Roles.MANAGER,
            };

            //Add Token to cookie

            await request(app)
                .post("/users")
                .set("Cookie", [`accessToken=${adminToken}`])
                .send(userData);
            // Assert
            // Check if user id matches with registered user

            const userRepository = connection.getRepository(User);

            const users = await userRepository.find();

            expect(users).toHaveLength(1);
            expect(users[0].role).toBe(Roles.MANAGER);
        });
    });
});
