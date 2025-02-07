import { NextRequest } from "next/server";

export const getRequestIp = (request: NextRequest) => {
  const ip = request.headers.get("x-forwarded-for")?.split(",").at(0)?.trim() ?? "UNKNOWN_IP";
  return ip;
};
