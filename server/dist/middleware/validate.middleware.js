"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const zod_1 = require("zod");
const validate = (schema) => {
    return async (req, res, next) => {
        try {
            if (schema.body)
                req.body = await schema.body.parseAsync(req.body);
            if (schema.query)
                req.query = await schema.query.parseAsync(req.query);
            if (schema.params)
                req.params = await schema.params.parseAsync(req.params);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                res.status(400).json({
                    status: "fail",
                    message: "Validation Error",
                    errors: error.errors.map((err) => ({
                        field: err.path.join("."),
                        message: err.message,
                    })),
                });
                return;
            }
            next(error);
        }
    };
};
exports.validate = validate;
