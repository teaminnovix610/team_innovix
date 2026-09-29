import { ZodError } from "zod";

const validate = (schema) => {
    return async (req, res, next) => {
        try {

            const validatedData = await schema.parseAsync({
                body: req.body,
                params: req.params,
                query: req.query,
            });

            req.validated = validatedData;

            next();

        } catch (error) {

            if (error instanceof ZodError) {

                return res.status(400).json({
                    success: false,
                    message: "Validation Failed",
                    errors: error.issues.map((issue) => ({
                        field: issue.path.join("."),
                        message: issue.message,
                    })),
                });

            }

            next(error);
        }
    };
};

export default validate;