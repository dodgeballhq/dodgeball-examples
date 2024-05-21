import { Request } from "express";

// Here's a simple utility method for grabbing the originating IP address from the request.
export const getIp = (req: Request): string => {
  const forwardedFor = req.headers["x-forwarded-for"];
  const remoteAddress = req.socket?.remoteAddress;
  const requestIp = req.ip;
  const hardCodedIpFallback = "76.90.54.224";

  let incomingIp: string | undefined;

  if (Array.isArray(forwardedFor)) {
    incomingIp = forwardedFor[0];
  } else if (typeof forwardedFor === "string") {
    incomingIp = forwardedFor.split(",")[0];
  } else if (remoteAddress) {
    incomingIp = remoteAddress;
  } else if (requestIp) {
    incomingIp = requestIp;
  }

  if (!incomingIp || incomingIp === "::1") {
    console.warn(`Returning hard-coded IP: ${hardCodedIpFallback}`);
    return hardCodedIpFallback;
  }

  return incomingIp.trim();
};
