import { Response } from "express";
import { ResgisterUserRequest } from "../types";
import { UserService } from "../services/UserService";

export class AuthController {
    constructor(private userService: UserService) {}

    async register(req: ResgisterUserRequest, res: Response) {
        const { firstName, lastName, email, password } = req.body;

        await this.userService.create({ firstName, lastName, email, password });

        res.status(201).json();
    }
}
