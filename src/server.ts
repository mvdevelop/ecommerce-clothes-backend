import app from "./app.js";

const PORT = parseInt(process.env.PORT || "5000", 10);

const server = app.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`
  );
});

process.on("unhandledRejection", (err: Error) => {
  console.error(`Error: ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});

process.on("uncaughtException", (err: Error) => {
  console.error(`Error: ${err.message}`);
  console.error("Shutting down due to uncaught exception");
  process.exit(1);
});

export default server;