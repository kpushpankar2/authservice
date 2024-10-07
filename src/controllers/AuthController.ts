import { NextFunction, Response } from "express";
import { ResgisterUserRequest } from "../types";
import { UserService } from "../services/UserService";
import { Logger } from "winston";
import { validationResult } from "express-validator";

export class AuthController {
    constructor(
        private userService: UserService,
        private logger: Logger,
    ) {}

    async register(
        req: ResgisterUserRequest,
        res: Response,
        next: NextFunction,
    ) {
        const result = validationResult(req);

        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() });
        }

        const { firstName, lastName, email, password } = req.body;

        this.logger.debug("New Request to register a user ", {
            firstName,
            lastName,
            email,
            password: "******",
        });

        try {
            await this.userService.create({
                firstName,
                lastName,
                email,
                password,
            });

            this.logger.info("User has been registered");

            res.status(201).json();
        } catch (err) {
            next(err);
            return;
        }
    }
}
