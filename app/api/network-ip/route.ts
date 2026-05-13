import { NextResponse } from "next/server";
import os from "os";

export async function GET() {
  const networkInterfaces = os.networkInterfaces();
  let ip = "localhost";
  
  for (const name of Object.keys(networkInterfaces)) {
    const interfaces = networkInterfaces[name];
    if (interfaces) {
      for (const net of interfaces) {
        if (net.family === "IPv4" && !net.internal) {
          ip = net.address;
          break;
        }
      }
    }
    if (ip !== "localhost") break;
  }

  return NextResponse.json({ ip, port: process.env.PORT || 3000 });
}
