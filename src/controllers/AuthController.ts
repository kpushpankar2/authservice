import { NextFunction, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { ResgisterUserRequest } from "../types";
import { UserService } from "../services/UserService";
import { Logger } from "winston";
import { validationResult } from "express-validator";
import { TokenService } from "../services/TokenService";

export class AuthController {
    constructor(
        private userService: UserService,
        private logger: Logger,
        private tokenService: TokenService,
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
            const user = await this.userService.create({
                firstName,
                lastName,
                email,
                password,
            });

            this.logger.info("User has been registered");

            const payload: JwtPayload = {
                sub: String(user.id),
                roles: user.role,
            };

            const accessToken = this.tokenService.generateAccessToken(payload);

            const newRefreshToken =
                await this.tokenService.persistRefreshToken(user);

            // const MS_IN_YEAR = 1000 * 60 * 60 * 24 * 365;
            // const refreshTokenRepository =
            //     AppDataSource.getRepository(RefreshToken);

            // const newRefreshToken = await refreshTokenRepository.save({
            //     user: user,

            //     expiresAt: new Date(Date.now() + MS_IN_YEAR),
            // });

            // const refreshToken = sign(payload, Config.REFRESH_TOKEN_SECRET!, {
            //     algorithm: "HS256",
            //     expiresIn: "1y",
            //     issuer: "auth-service",
            //     jwtid: String(newRefreshToken.id),
            // });

            const refreshToken = this.tokenService.generateRefreshToken({
                ...payload,
                id: String(newRefreshToken.id),
            });
            res.cookie("accessToken", accessToken, {
                domain: "localhost",
                sameSite: "strict",
                maxAge: 1000 * 60 * 60, // 1hr
                httpOnly: true,
            });

            res.cookie("refreshToken", refreshToken, {
                domain: "localhost",
                sameSite: "strict",
                maxAge: 1000 * 60 * 60 * 24 * 365, // 1Y
                httpOnly: true,
            });

            res.status(201).json({ id: user.id });
        } catch (err) {
            next(err);
            return;
        }
    }
}
