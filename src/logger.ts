import pino from "pino";

const isProd = process.env.NODE_ENV === "production";

export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  base: undefined,
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: ["req.headers.authorization", "req.headers.cookie", "password", "access_token"],
    remove: true,
  },
  transport: isProd
    ? undefined
    : {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:yyyy-mm-dd HH:MM:ss.l o",
          singleLine: true,
          ignore: "pid,hostname",
          messageFormat: "{req.method} {req.url} {res.statusCode} {responseTime}ms - {msg}",
        },
      },
});
