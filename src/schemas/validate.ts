import type { RequestHandler } from "express";
import type { ParamsDictionary } from "express-serve-static-core";
import type { ParsedQs } from "qs";
import { ZodType } from "zod";

type Schemas = {
  body?: ZodType;
  query?: ZodType;
  params?: ZodType;
};

export const validate = (schemas: Schemas): RequestHandler => {
  return async (req, _res, next) => {
    try {
      if (schemas.body) {
        const result = await schemas.body.safeParseAsync(req.body);
        if (!result.success) throw result.error;
        req.body = result.data;
      }
      if (schemas.query) {
        const result = schemas.query.safeParse(req.query);
        if (!result.success) throw result.error;
        (req as any).query = result.data as ParsedQs;
      }
      if (schemas.params) {
        const result = schemas.params.safeParse(req.params);
        if (!result.success) throw result.error;
        (req as any).params = result.data as ParamsDictionary;
      }
      next();
    } catch (err) {
      next(err);
    }
  };
};
