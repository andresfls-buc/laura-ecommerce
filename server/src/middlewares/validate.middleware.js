import Boom from "@hapi/boom";

export const validate = (schema, property = "body") => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false
    });

    if (error) {
      return next(
        Boom.badRequest(
          error.details.map(detail => detail.message).join(", ")
        )
      );
    }

    req[property] = value;
    next();
  };
};
